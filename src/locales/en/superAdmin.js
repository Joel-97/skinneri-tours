const superAdmin = {

  /*
  ==========================================================
  ACCESS REQUESTS
  ==========================================================
  */

  accessRequests: {

    /*
    ========================================================
    PAGE
    ========================================================
    */

    title:
      "Access Requests",

    subtitle:
      "Review and manage access requests submitted by new users.",

    /*
    ========================================================
    FILTERS
    ========================================================
    */

    search:
      "Search",

    searchPlaceholder:
      "Search by name or email...",

    all:
      "All",

    pending:
      "Pending",

    approved:
      "Approved",

    rejected:
      "Rejected",

    /*
    ========================================================
    TABLE
    ========================================================
    */

    table: {

      name:
        "Name",

      email:
        "Email",

      requestedAt:
        "Requested",

      status:
        "Status",

      actions:
        "Actions"

    },

    /*
    ========================================================
    DETAILS
    ========================================================
    */

    details: {

      title:
        "Request Details",

      company:
        "Company",

      companyName:
        "Company Name",

      createCompany:
        "Create New Company",

      existingCompany:
        "Select Existing Company",

      enabledModules:
        "Enabled Modules",

      role:
        "Role"

    },

    /*
    ========================================================
    ACTIONS
    ========================================================
    */

    actions: {

      view:
        "View",

      approve:
        "Approve",

      reject:
        "Reject",

      cancel:
        "Cancel",

      save:
        "Save"

    },

    /*
    ========================================================
    STATUS
    ========================================================
    */

    status: {

      pending:
        "Pending",

      approved:
        "Approved",

      rejected:
        "Rejected"

    },
    
    /*
    ========================================================
    REJECT
    ========================================================
    */

    reject: {

      title:
        "Reject Request",

      description:
        "Are you sure you want to reject this access request? This action cannot be undone."

    },

    /*
    ========================================================
    EMPTY
    ========================================================
    */

    empty:
      "No access requests found."

  }

};

export default superAdmin;