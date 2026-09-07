import "./button/define";
import "./field/define";
import "./select/define";
import "./option/define";
import "./radio-group/define";
import "./radio/define";
import "./dialog/define";
import "./disclosure/define";
import "./status-message/define";

/**
 * Registers every shared FASTElement primitive once, under the "ds-" prefix. Import this
 * module for its side effect (src/main.tsx and .storybook/preview.ts do) before React ever
 * creates one of these tags, so the elements are fully upgraded by the time components mount.
 */

