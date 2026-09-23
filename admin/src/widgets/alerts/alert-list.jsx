import PropTypes from "prop-types";
import { Alert } from "@material-tailwind/react";
import { useState, useEffect, useContext } from "react";
import { AlertContext } from "@/context";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

export function AlertList() {
  const { alerts, setAlerts, hideAllAlerts } = useContext(AlertContext);

  const [disposeTimeouts, setDisposeTimeouts] = useState({});

  useEffect(() => {
    for (let key in alerts) {
      if (!disposeTimeouts[key]) {
        const timeout = setTimeout(() => {
          hideAlert(key);
        }, 3000);
        setDisposeTimeouts((current) => ({ ...current, [key]: timeout }));
      }
    }
  }, [alerts]);

  const hideAlert = (index) => {
    setDisposeTimeouts((current) => {
      const newTimeouts = { ...current };
      delete newTimeouts[index];
      return newTimeouts;
    });

    setAlerts((current) => {
      const newAlerts = { ...current };
      delete newAlerts[index];
      return newAlerts;
    });
  };

  const makeAlert = (alertData, key) => {
    const { message, type, details, open } = alertData;

    let color;
    let icon;

    switch (type) {
      case "success":
        color = "light-green";
        icon = <CheckCircleIcon strokeWidth={2} className="h-6 w-6" />;
        break;
      case "error":
        color = "red";
        icon = <ExclamationTriangleIcon strokeWidth={2} className="h-6 w-6" />;
        break;
      case "info":
        color = "blue-gray";
        icon = <InformationCircleIcon strokeWidth={2} className="h-6 w-6" />;
        break;
      default:
        color = "amber";
        icon = <ExclamationCircleIcon strokeWidth={2} className="h-6 w-6" />;
    }

    return (
      <Alert
        key={key}
        variant="gradient"
        open={open}
        color={color}
        icon={icon}
        onClose={() => hideAlert(key)}
        animate={{
          mount: { y: 0 },
          unmount: { y: 100 },
        }}
      >
        {message}
        {details && (
          <div
            className="mt-2 text-sm"
            dangerouslySetInnerHTML={{ __html: details }}
          />
        )}
      </Alert>
    );
  };

  let Alerts = [];

  if (Object.keys(alerts).length > 0) {
    for (let key in alerts) {
      const alertData = alerts[key];
      Alerts.push(makeAlert(alertData, key));
    }
  }

  return (
    <>
      {Alerts.length === 0 ? null : (
        <div
          id="snackbar"
          className="fixed right-0 top-5 z-50 flex flex-col gap-2"
        >
          {Alerts}
        </div>
      )}
    </>
  );
}

AlertList.defaultProps = {
  action: null,
};

AlertList.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string.isRequired,
      message: PropTypes.node.isRequired,
      open: PropTypes.bool.isRequired,
      icon: PropTypes.node,
    }),
  ),
};

AlertList.displayName = "/src/widgets/cards/alert-list.jsx";

export default AlertList;
