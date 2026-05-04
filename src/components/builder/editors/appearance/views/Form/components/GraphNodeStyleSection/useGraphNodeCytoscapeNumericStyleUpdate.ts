import { useCallback } from 'react';

import { AppearanceActions, AppearanceSelectors } from '@/store/builder/appearance/appearance.reducers';
import { useBuilderDispatch, useBuilderSelector } from '@/store/builder/hooks';
import { UISelectors } from '@/store/builder/ui/ui.reducers';
import {
  CytoscapeNodeTypesStyles,
  GraphNodeState,
  GraphNodeType,
  ThemeConfig,
} from '@/types/customization';

export const useGraphNodeCytoscapeNumericStyleUpdate = () => {
  const dispatch = useBuilderDispatch();
  const theme = useBuilderSelector(UISelectors.selectTheme);
  const config = useBuilderSelector(AppearanceSelectors.selectThemeConfig);

  const changeHandler = useCallback(
    (type: GraphNodeType, field: string, value?: number, state?: GraphNodeState) => {
      if (!config) return;

      let updatedNode: CytoscapeNodeTypesStyles = {
        ...config.graph.cytoscapeStyles.node,
      };

      if (state) {
        updatedNode = {
          ...updatedNode,
          [type]: {
            ...updatedNode[type],
            states: {
              ...updatedNode[type]?.states,
              [state]: {
                ...updatedNode[type]?.states?.[state],
                [field]: value,
              },
            },
          },
        };
      } else {
        updatedNode = {
          ...updatedNode,
          [type]: {
            ...updatedNode[type],
            [field]: value,
          },
        };
      }

      const updatedConfig: ThemeConfig = {
        ...config,
        graph: {
          ...config.graph,
          cytoscapeStyles: {
            ...config.graph.cytoscapeStyles,
            node: {
              ...config.graph.cytoscapeStyles.node,
              ...updatedNode,
            },
          },
        },
      };

      dispatch(
        AppearanceActions.updateThemeConfig({
          theme,
          config: updatedConfig,
        }),
      );
    },
    [config, dispatch, theme],
  );

  return { changeHandler, config };
};
