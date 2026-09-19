import React, { createContext, useContext, useState, useCallback, PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  CustomAlertModal,
  AlertOptionItem,
  AlertDetailItem,
} from '@/components/ui/CustomAlertModal';
import { MaterialIcons } from '@expo/vector-icons';

export interface AlertConfig {
  title: string;
  message?: string;
  type?: 'info' | 'confirm' | 'destructive' | 'success' | 'select';
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeBgColor?: string;
  options?: AlertOptionItem[];
  selectedOptionValue?: string;
  details?: AlertDetailItem[];
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (selectedValue?: string) => void | Promise<void>;
  onCancel?: () => void;
  dismissible?: boolean;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {},
  hideAlert: () => {},
});

export const AlertProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({
    title: '',
  });

  const showAlert = useCallback((newConfig: AlertConfig) => {
    setConfig(newConfig);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  const handleConfirm = useCallback(
    async (selectedValue?: string) => {
      setVisible(false);
      if (config.onConfirm) {
        await config.onConfirm(selectedValue);
      }
    },
    [config]
  );

  const handleCancel = useCallback(() => {
    setVisible(false);
    if (config.onCancel) {
      config.onCancel();
    }
  }, [config]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      <View style={styles.rootContainer}>
        {children}
        {visible && (
          <CustomAlertModal
            visible={visible}
            title={config.title}
            message={config.message}
            type={config.type}
            icon={config.icon}
            iconColor={config.iconColor}
            iconBgColor={config.iconBgColor}
            badgeText={config.badgeText}
            badgeColor={config.badgeColor}
            badgeBgColor={config.badgeBgColor}
            options={config.options}
            selectedOptionValue={config.selectedOptionValue}
            details={config.details}
            confirmText={config.confirmText}
            cancelText={config.cancelText}
            dismissible={config.dismissible}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onClose={hideAlert}
          />
        )}
      </View>
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'relative',
  },
});
