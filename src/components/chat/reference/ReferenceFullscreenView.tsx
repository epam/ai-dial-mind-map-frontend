import classNames from 'classnames';
import { useCallback, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import Slider from 'react-slick';

import { useChatDispatch, useChatSelector } from '@/store/chat/hooks';
import { MindmapActions, MindmapSelectors } from '@/store/chat/mindmap/mindmap.reducers';
import { DocsReference, NodeReference } from '@/types/graph';

import { ReferenceFooter } from './components/ReferenceFooter';
import { ReferenceHeader } from './components/ReferenceHeader';
import { useReferenceSlider } from './hooks/useReferenceSlider';

interface Props {
  references: Array<DocsReference | NodeReference>;
}

export const ReferenceFullscreenView: React.FC<Props> = ({ references }) => {
  const dispatch = useChatDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenInitialSlide = useChatSelector(MindmapSelectors.selectFullscreenInitialSlide);

  const onCloseFullscreenReferences = useCallback(() => {
    dispatch(MindmapActions.closeFullscreenReferences());
  }, [dispatch]);

  useHotkeys(['esc'], () => onCloseFullscreenReferences());

  const { Title, current, prev, next, sliderRef, slides, settings } = useReferenceSlider({
    references,
    isFullscreen: true,
    containerRef,
    initialSlideNumber: fullscreenInitialSlide ?? 0,
  });

  return (
    <div
      className={classNames(
        'reference-view absolute top-0 left-0 z-40 flex size-full flex-col rounded-lg border-2 border-primary bg-layer-0',
      )}
    >
      <div className="flex-none border-b border-secondary">
        <ReferenceHeader
          title={Title}
          current={current}
          total={references.length}
          onCloseFullscreen={onCloseFullscreenReferences}
          isFullscreen
        />
      </div>

      <div className="h-full flex-1 overflow-visible" ref={containerRef}>
        <Slider ref={sliderRef} {...settings} className="fullscreen-slider h-full">
          {slides}
        </Slider>
      </div>

      <ReferenceFooter current={current} total={references.length} onPrev={prev} onNext={next} />
    </div>
  );
};
