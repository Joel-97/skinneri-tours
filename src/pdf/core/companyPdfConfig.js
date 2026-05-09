export const getCompanyPDFConfig = (
  company
) => {

  return {

    companyName:
      company?.name || "",

    legalName:
      company?.legalName || "",

    identification:
      company?.identificationNumber || "",

    email:
      company?.email || "",

    phone:
      company?.phone || "",

    website:
      company?.website || "",

    address:
      company?.address || "",

    city:
      company?.city || "",

    province:
      company?.province || "",

    country:
      company?.country || "",

    postalCode:
      company?.postalCode || "",

    timezone:
      company?.timezone || "",

    primaryColor:
      company?.primaryColor || "#0A1E5E"

  };

};