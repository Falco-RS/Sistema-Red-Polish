import { createContext, useContext, useState } from 'react';

const LoaderContext = createContext<{
  showLoader: () => void;
  hideLoader: () => void;
  visible: boolean;
}>({
  showLoader: () => {},
  hideLoader: () => {},
  visible: false,
});

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);

  const showLoader = () => setVisible(true);
  const hideLoader = () => setVisible(false);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, visible }}>
      {children}
      {visible && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', zIndex: 9999 }}
        >
          <div className="text-center">
            <div className="spinner-border text-secondary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-secondary fw-semibold fs-5">
              Estamos procesando tu solicitud. Por favor espera...
            </p>
          </div>
        </div>
      )}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);