import { useState } from "react";

import { useAuth } from "../../../../../context/AuthContext";

import { updateCompanyData } from "../../../../../services/superAdmin/companyProfile";

import {
  uploadCompanyLogo,
  removeCompanyLogo
} from "../../../../../services/superAdmin/uploadCompanyLogo";

import {
  notifySuccess,
  notifyError
} from "../../../../../services/notificationService";

import CompanyProfileForm from "./CompanyProfileForm";

import "../../../../../style/settings/general/companyProfile.css";

const CompanyProfileSection = () => {
  const {
    session
  } = useAuth();

  const company = session?.company;
  const companyId = company?.id;

  const [loading, setLoading] =
    useState(false);

  const [uploadingLogo, setUploadingLogo] =
    useState(false);

  /* ======================================================
     SAVE COMPANY DATA
  ====================================================== */

  const handleSave = async (formData) => {
    if (!companyId) {
      return;
    }

    try {
      setLoading(true);

      await updateCompanyData(
        companyId,
        formData
      );

      notifySuccess(
        "Perfil actualizado",
        "La información de la empresa fue actualizada correctamente."
      );
    } catch (error) {
      console.error(
        "Error actualizando empresa:",
        error
      );

      notifyError(
        "Error",
        "No se pudo actualizar la información de la empresa."
      );

      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     UPLOAD COMPANY LOGO
  ====================================================== */

  const handleLogoUpload = async (file) => {
    if (!companyId || !file) {
      return null;
    }

    try {
      setUploadingLogo(true);

      const updatedCompany =
        await uploadCompanyLogo({
          companyId,
          file
        });

      notifySuccess(
        "Logo actualizado",
        "El logo fue cargado correctamente."
      );

      return updatedCompany;
    } catch (error) {
      console.error(
        "Error subiendo logo:",
        error
      );

      notifyError(
        "Error",
        "No se pudo subir el logo."
      );

      throw error;
    } finally {
      setUploadingLogo(false);
    }
  };

  /* ======================================================
     REMOVE COMPANY LOGO
  ====================================================== */

  const handleRemoveLogo = async (logoURL) => {
    if (!companyId) {
      return;
    }

    try {
      setUploadingLogo(true);

      await removeCompanyLogo({
        companyId,
        logoURL
      });

      notifySuccess(
        "Logo eliminado",
        "El logo fue eliminado correctamente."
      );
    } catch (error) {
      console.error(
        "Error removing logo:",
        error
      );

      notifyError(
        "Error",
        "No se pudo eliminar el logo."
      );

      throw error;
    } finally {
      setUploadingLogo(false);
    }
  };

  /* ======================================================
     RENDER
  ====================================================== */

  if (!company) {
    return null;
  }

  return (
    <CompanyProfileForm
      company={company}
      loading={loading}
      uploadingLogo={uploadingLogo}
      onSave={handleSave}
      onUploadLogo={handleLogoUpload}
      onRemoveLogo={handleRemoveLogo}
    />
  );
};

export default CompanyProfileSection;