// SSR-safe no-op stubs for Emotion to avoid importing client-only React APIs on server
export const CacheProvider = ({ children }) => children;
export const ThemeProvider = ({ children }) => children;
export const Global = () => null;
export const jsx = () => null;
export const keyframes = () => {};
export const useTheme = () => ({});
export default {};


