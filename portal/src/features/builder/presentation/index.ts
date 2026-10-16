import type { ReadyBuilderContracts } from "@duke333/builder-ui";
import type { BuilderHooks } from "@duke333/builder-ui/hooks";
import { createAppBuilderForm } from "./AppBuilderForm";
import { createAppBuilderGrid } from "./AppBuilderGrid";
import { createAppBuilderView } from "./AppBuilderView";

export type {
  AppBuilderColumn,
  AppBuilderViewDefinition,
  AppBuilderViewEntry,
  AppBuilderViewExtension,
} from "./AppBuilderView";
export { createAppBuilderView };

export function createAppBuilderRuntimeComponents(hooks: BuilderHooks<ReadyBuilderContracts>) {
  return {
    Form: createAppBuilderForm(hooks),
    Grid: createAppBuilderGrid(hooks),
    View: createAppBuilderView(hooks),
  };
}
