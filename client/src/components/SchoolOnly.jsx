import { Link } from "react-router-dom";
import { School } from "lucide-react";
import { useRole } from "../context/RoleContext";
import { useLanguage } from "../context/LanguageContext";

function SchoolOnly({ children }) {
  const { user, school } = useRole();
  const { t } = useLanguage();
  const allowed = user?.accountType === "institution" || user?.accountType === "teacher" || Boolean(school);

  if (!allowed) {
    return (
      <div className="page-container">
        <div className="card" style={{ maxWidth: 560, margin: "40px auto", padding: 32, textAlign: "center" }}>
          <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: 12 }}>
            <School size={40} color="var(--vt-orange)" />
          </div>
          <h3>{t("Institution or Teacher Account Required")}</h3>
          <p style={{ color: "var(--vt-muted)", marginBottom: 20 }}>
            {t("Sign in with a school or teacher account, or register your school to access this workspace.")}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn btn-primary" to="/auth/signup?type=institution">
              {t("Register School")}
            </Link>
            <Link className="btn btn-secondary" to="/auth/login">
              {t("Sign In")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export { SchoolOnly as default };
