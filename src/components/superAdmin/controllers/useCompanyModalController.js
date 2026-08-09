import {

  useEffect,
  useState

} from "react";

/*
==========================================================
EMPTY COMPANY
==========================================================
*/

const emptyCompany = {

  name: "",

  legalName: "",

  identificationType: "",

  identificationNumber: "",

  email: "",

  phone: "",

  website: "",

  timezone: "",

  primaryColor: "#08204B",

  country: "",

  province: "",

  city: "",

  address: "",

  postalCode: "",

  logoURL: "",

  status: "active",

  enabledModules: []

};

/*
==========================================================
CONTROLLER
==========================================================
*/

export default function useCompanyModalController({

  company,

  open,

  mode

}) {

  /*
  ==========================================================
  FORM
  ==========================================================
  */

  const [

    data,

    setData

  ] = useState(emptyCompany);

  /*
  ==========================================================
  EFFECTS
  ==========================================================
  */

  useEffect(() => {

    if (!open) {

      return;

    }

    if (company) {

      setData({

        ...emptyCompany,

        ...company,

        enabledModules:

          company.enabledModules || []

      });

    }

    else {

      setData(emptyCompany);

    }

  }, [

    company,

    open

  ]);

  /*
  ==========================================================
  SETTINGS
  ==========================================================
  */

  const readOnly =

    mode === "view";

  /*
  ==========================================================
  ACTIONS
  ==========================================================
  */

  const handleChange = (event) => {

    const {

      name,

      value

    } = event.target;

    setData(prev => ({

      ...prev,

      [name]: value

    }));

  };

  const handleSelectChange = (

    field,

    option

  ) => {

    setData(prev => ({

      ...prev,

      [field]:

        option?.value || ""

    }));

  };

  const handleToggleArray = (

    field,

    value

  ) => {

    setData(prev => {

      const items =

        prev[field] || [];

      const exists =

        items.includes(value);

      return {

        ...prev,

        [field]:

          exists

            ? items.filter(

                item =>

                  item !== value

              )

            : [

                ...items,

                value

              ]

      };

    });

  };

  /*
  ==========================================================
  FORM
  ==========================================================
  */

  const form = {

    data,

    readOnly

  };

  /*
  ==========================================================
  ACTIONS
  ==========================================================
  */

  const actions = {

    handleChange,

    handleSelectChange,

    handleToggleArray

  };

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return {

    form,

    actions

  };

}