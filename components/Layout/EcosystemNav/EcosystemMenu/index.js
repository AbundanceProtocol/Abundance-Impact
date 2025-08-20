import React, { useContext } from 'react';
import { AccountContext } from '../../../../context';
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints';
import { useAppRouter } from '../../../../hooks/useAppRouter';

const EcosystemNav = ({size}) => {
  const { ecosystemsData, ecoData, handleEcoChange } = useContext(AccountContext)
  const { isMobile } = useMatchBreakpoints();
  const router = useAppRouter()

  return (
    <div
      className={isMobile ? "" : "left-container"}
      style={{ margin: "0", maxWidth: "237px", width: "auto" }}
    >
      <div
        style={{
          backgroundColor: "#334455ee",
          borderRadius: "16px",
          padding: "0px",
          border: "0px solid #678",
          color: "#fff",
          fontWeight: "700",
          alignItems: " center",
          fontSize: "20px",
        }}
      >
        <div className="flex-row" style={{ gap: "0.5rem" }}>
          <select
            id="minuteSelect"
            value={
              router.route == "/" ? "Select" : ecoData?.ecosystem_points_name
            }
            onChange={handleEcoChange}
            style={{
              backgroundColor: "#adf",
              borderRadius: "4px",
              fontSize: isMobile ? "15px" : "18px",
              fontWeight: size == "large" ? "600" : "500",
              padding: isMobile
                ? size == "large"
                  ? "4px 1px"
                  : "1px 1px"
                : size == "large"
                ? "4px 3px"
                : "0px 3px",
            }}
          >
            {router.route == "/" && (
              <option key="" value="Select">
                Select
              </option>
            )}
            {ecosystemsData.map((ecosystem) => (
              <option
                key={ecosystem.ecosystem_points_name}
                value={ecosystem.ecosystem_points_name}
              >
                {ecosystem.ecosystem_handle}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default EcosystemNav;