import { useAuth } from "../../../../../context/AuthContext";

import EmailSettingsForm from "./EmailSettingsForm";

import "../../../../../style/settings/general/emailSettings.css";

const EmailSettingsSection = () => {
  const {
    session
  } = useAuth();

  const company =
    session?.company;

  if (!company) {
    return null;
  }

  return (
    <EmailSettingsForm
      company={company}
    />
  );
};

export default EmailSettingsSection;