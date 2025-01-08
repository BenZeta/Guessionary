import {
  createContext,
  useState,
  ReactNode,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";

// Define the structure of the theme
interface Theme {
  light: {
    bgColor: string;
  };
  dark: {
    bgColor: string;
  };
}

// Define the context type
interface ThemeContextType {
  currentTheme: string;
  setCurrentTheme: Dispatch<SetStateAction<string>>;
  theme: Theme;
}

// Create the context with an initial value
export const themeContext = createContext<ThemeContextType>({
  currentTheme: "light",
  setCurrentTheme: () => {},
  theme: {
    light: {
      bgColor: "",
    },
    dark: {
      bgColor: "",
    },
  },
});

interface ThemeContextProviderProps {
  children: ReactNode;
}

// Define the context provider component
const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({
  children,
}) => {
  const [currentTheme, setCurrentTheme] = useState<string>("light");

  const theme: Theme = {
    light: {
      bgColor: "bg-gradient-to-br from-[#9DE6FF] to-[#58BFE2]",
    },
    dark: {
      bgColor: "bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600",
    },
  };

  return (
    <themeContext.Provider value={{ currentTheme, setCurrentTheme, theme }}>
      {children}
    </themeContext.Provider>
  );
};

export default ThemeContextProvider;

// Custom hook to access the theme context
export const useTheme = () => {
  const context = useContext(themeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
};
