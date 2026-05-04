import { useCallback, useMemo } from 'react';

import { DefaultCytoscapeImagedNodeStatesStyles } from '@/constants/appearances/defaultConfig';
import { GraphImgResourceKey, GraphNodeState, GraphNodeType, NodeStylesKey } from '@/types/customization';

import { GraphNodeSettingsTable, GraphNodeSettingsTableData } from './GraphNodeSettingsTable';
import { defaultNumericForTypographyField } from './graphNodeTypographyDefaults';
import { useGraphNodeCytoscapeNumericStyleUpdate } from './useGraphNodeCytoscapeNumericStyleUpdate';

const DIMENSION_ROW_KEYS: NodeStylesKey[] = [NodeStylesKey.Width, NodeStylesKey.Height];
const TYPOGRAPHY_ROW_KEYS: NodeStylesKey[] = [NodeStylesKey.FontSize, NodeStylesKey.TextMarginY];

const DisabledTooltipText = 'Add default icon to customize settings';

export const GraphNodesDimensionSettingsTables = () => {
  const { changeHandler, config } = useGraphNodeCytoscapeNumericStyleUpdate();

  const isTableDisabled = useMemo(
    () => !(config?.graph.useNodeIconAsBgImage && config.graph.images?.[GraphImgResourceKey.DefaultBgImg]),
    [config?.graph],
  );

  const getTableData = useCallback(
    (type: GraphNodeType): GraphNodeSettingsTableData => {
      const nodeSettings = config?.graph.cytoscapeStyles.node?.[type];

      const res: GraphNodeSettingsTableData = {};

      for (const field of DIMENSION_ROW_KEYS) {
        res[field] = {
          base: nodeSettings?.[field] ?? DefaultCytoscapeImagedNodeStatesStyles?.[type]?.[field],
          [GraphNodeState.Hovered]:
            nodeSettings?.states?.[GraphNodeState.Hovered]?.[field] ??
            DefaultCytoscapeImagedNodeStatesStyles?.[type]?.states?.[GraphNodeState.Hovered]?.[field],
        };
      }

      return res;
    },
    [config],
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-6">
        <GraphNodeSettingsTable
          type={GraphNodeType.Root}
          showRowLabels={true}
          rowKeys={DIMENSION_ROW_KEYS}
          data={getTableData(GraphNodeType.Root)}
          onChange={changeHandler}
          disabled={isTableDisabled}
          disabledTooltipText={DisabledTooltipText}
        />
        <GraphNodeSettingsTable
          type={GraphNodeType.Level1}
          rowKeys={DIMENSION_ROW_KEYS}
          data={getTableData(GraphNodeType.Level1)}
          onChange={changeHandler}
          disabled={isTableDisabled}
          disabledTooltipText={DisabledTooltipText}
        />
        <GraphNodeSettingsTable
          type={GraphNodeType.Level2}
          rowKeys={DIMENSION_ROW_KEYS}
          data={getTableData(GraphNodeType.Level2)}
          onChange={changeHandler}
          disabled={isTableDisabled}
          disabledTooltipText={DisabledTooltipText}
        />
      </div>
    </div>
  );
};

export const GraphNodesTypographySettingsTables = () => {
  const { changeHandler, config } = useGraphNodeCytoscapeNumericStyleUpdate();

  const getTableData = useCallback(
    (type: GraphNodeType): GraphNodeSettingsTableData => {
      const nodeSettings = config?.graph.cytoscapeStyles.node?.[type];
      const res: GraphNodeSettingsTableData = {};

      for (const field of TYPOGRAPHY_ROW_KEYS) {
        res[field] = {
          base: nodeSettings?.[field] ?? defaultNumericForTypographyField(type, field),
          [GraphNodeState.Hovered]:
            nodeSettings?.states?.[GraphNodeState.Hovered]?.[field] ??
            defaultNumericForTypographyField(type, field, GraphNodeState.Hovered),
        };
      }

      return res;
    },
    [config],
  );

  return (
    <div className="overflow-x-auto">
        <div className="flex gap-6">
          <GraphNodeSettingsTable
            type={GraphNodeType.Root}
            showRowLabels={true}
            rowKeys={TYPOGRAPHY_ROW_KEYS}
            data={getTableData(GraphNodeType.Root)}
            onChange={changeHandler}
          />
          <GraphNodeSettingsTable
            type={GraphNodeType.Level1}
            rowKeys={TYPOGRAPHY_ROW_KEYS}
            data={getTableData(GraphNodeType.Level1)}
            onChange={changeHandler}
          />
          <GraphNodeSettingsTable
            type={GraphNodeType.Level2}
            rowKeys={TYPOGRAPHY_ROW_KEYS}
            data={getTableData(GraphNodeType.Level2)}
            onChange={changeHandler}
          />
        </div>
    </div>
  );
};
