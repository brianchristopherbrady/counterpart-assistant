import type { Preview } from "@storybook/react-vite";
import "../src/design-system/elements/define";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
