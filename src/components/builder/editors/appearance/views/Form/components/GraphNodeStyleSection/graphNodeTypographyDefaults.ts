import {
  DefaultHoveredLevel1NodeFontSize,
  DefaultHoveredLevel2NodeFontSize,
  DefaultHoveredRootNodeFontSize,
  DefaultLevel1NodeFontSize,
  DefaultLevel2NodeFontSize,
  DefaultRootNodeFontSize,
} from '@/constants/app';
import { GraphNodeState, GraphNodeType, NodeStylesKey } from '@/types/customization';

export const DefaultGraphNodeTextMarginY = 0.5;

const defaultFontSizeForNodeType = (type: GraphNodeType, state?: GraphNodeState): number => {
  if (state === GraphNodeState.Hovered) {
    switch (type) {
      case GraphNodeType.Root:
        return DefaultHoveredRootNodeFontSize;
      case GraphNodeType.Level1:
        return DefaultHoveredLevel1NodeFontSize;
      case GraphNodeType.Level2:
        return DefaultHoveredLevel2NodeFontSize;
      default:
        return DefaultHoveredRootNodeFontSize;
    }
  }

  switch (type) {
    case GraphNodeType.Root:
      return DefaultRootNodeFontSize;
    case GraphNodeType.Level1:
      return DefaultLevel1NodeFontSize;
    case GraphNodeType.Level2:
      return DefaultLevel2NodeFontSize;
    default:
      return DefaultRootNodeFontSize;
  }
};

export const defaultNumericForTypographyField = (
  type: GraphNodeType,
  field: NodeStylesKey,
  state?: GraphNodeState,
): number | undefined => {
  if (field === NodeStylesKey.TextMarginY) {
    return state === GraphNodeState.Hovered ? undefined : DefaultGraphNodeTextMarginY;
  }

  if (field === NodeStylesKey.FontSize) {
    return defaultFontSizeForNodeType(type, state);
  }

  return undefined;
};
