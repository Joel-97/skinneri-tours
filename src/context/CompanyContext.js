import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "../firebase";
import { UserAuth } from "./AuthContext";

const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {

  const { adminData } = UserAuth();

  const [company, setCompany] = useState(null);

  const [companyId, setCompanyId] = useState(null);

  const [loadingCompany, setLoadingCompany] = useState(true);

  /* ======================================================
     LOAD COMPANY
  ====================================================== */

  const refreshCompany = useCallback(async () => {

    setLoadingCompany(true);

    try {

      if (
        !adminData ||
        adminData.status !== "approved" ||
        !adminData.companyId
      ) {

        setCompany(null);
        setCompanyId(null);

        return;
      }

      setCompanyId(adminData.companyId);

      const companyRef = doc(
        db,
        "companies",
        adminData.companyId
      );

      const companySnap = await getDoc(companyRef);

      if (companySnap.exists()) {

        setCompany({
          id: companySnap.id,
          ...companySnap.data()
        });

      } else {

        setCompany(null);

      }

    } catch (error) {

      console.error(
        "Error loading company:",
        error
      );

      setCompany(null);
      setCompanyId(null);

    } finally {

      setLoadingCompany(false);

    }

  }, [adminData]);

  /* ======================================================
     UPDATE LOCAL COMPANY
  ====================================================== */

  const updateCompany = (data) => {

    setCompany((prev) => ({

      ...prev,

      ...data

    }));

  };

  /* ======================================================
     CLEAR COMPANY
  ====================================================== */

  const clearCompany = () => {

    setCompany(null);

    setCompanyId(null);

  };

  /* ======================================================
     EFFECT
  ====================================================== */

  useEffect(() => {

    refreshCompany();

  }, [refreshCompany]);

  /* ======================================================
     CONTEXT VALUE
  ====================================================== */

  const value = {

    company,

    companyId,

    loadingCompany,

    refreshCompany,

    updateCompany,

    clearCompany

  };

  return (

    <CompanyContext.Provider value={value}>

      {children}

    </CompanyContext.Provider>

  );

};