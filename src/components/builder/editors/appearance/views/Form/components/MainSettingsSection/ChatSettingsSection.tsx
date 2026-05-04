import { ChatBgSubSection } from './ChatBgSubSection';
import { ChatPositionSubSection } from './ChatPositionSubSection';
import { MaxNodesLimitSubSection } from './MaxNodesLimitSubSection';
import { ResponsiveThresholdsSubSection } from './ResponsiveThresholdsSubSection';

export const MainSettingsSection = () => {
  return (
    <div className="flex flex-col gap-6">
      <ChatPositionSubSection />
      <ChatBgSubSection />
      <MaxNodesLimitSubSection />
      <ResponsiveThresholdsSubSection />
    </div>
  );
};
