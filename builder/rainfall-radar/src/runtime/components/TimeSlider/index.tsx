import { React } from 'jimu-core';
import { Slider } from 'jimu-ui';
import { CalciteButton } from 'calcite-components';
import { RainviewerItem } from '../../../config';

import './index.css';

const { useCallback, useLayoutEffect, useRef } = React;

interface TimeSliderProps {
  timePath: RainviewerItem;
  setTimePath: Function;
  play: boolean;
  setPlay: Function;
  timePathList: RainviewerItem[];
}

const renderTimePath = (time: number): string => {
  return new Date(time * 1000).toLocaleString([], {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

const MapDatepicker = ({
  timePath,
  setTimePath,
  play,
  setPlay,
  timePathList
}: TimeSliderProps): JSX.Element => {
  const tpIndex =
    timePathList.length === 1
      ? 0
      : timePathList.findIndex((tp) => tp.time === timePath.time);

  const tpIndexRef = useRef(tpIndex);
  const frame = useRef(0);

  const getNextTime = useCallback(() => {
    tpIndexRef.current =
      tpIndexRef.current === timePathList.length - 1
        ? 0
        : tpIndexRef.current + 1;
    setTimePath(timePathList[tpIndexRef.current]);
  }, [setTimePath, timePathList]);

  useLayoutEffect(() => {
    let intervalPlay: NodeJS.Timer;
    const fps = 7;

    const playProcess = () => {
      intervalPlay = setTimeout(() => {
        getNextTime();
        frame.current = requestAnimationFrame(playProcess);
      }, 1000 / fps);
    };

    if (play) {
      frame.current = requestAnimationFrame(playProcess);
    } else {
      clearTimeout(intervalPlay);
      cancelAnimationFrame(frame.current);
    }

    return () => {
      clearTimeout(intervalPlay);
      cancelAnimationFrame(frame.current);
    };
  }, [getNextTime, play]);

  // toggle play pause
  const onTogglePlay = () => {
    setPlay(!play);
  };

  const onNextTime = () => {
    getNextTime();
  };

  const onTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimePath(timePathList[e.target.valueAsNumber]);
    tpIndexRef.current = e.target.valueAsNumber;
  };

  const getTextColor = () => {
    if (timePath.path.includes('nowcast_')) return 'green';
    if (timePathList.length !== 1 && timePath.time !== timePathList[12].time)
      return 'black';
    return 'blue';
  };

  return (
    <div className="date-grid">
      <CalciteButton
        title="Play Pause"
        iconStart={play ? 'pause-f' : 'play-f'}
        round
        onClick={onTogglePlay}
        // disabled={prevDisabled}
        className="play-button"
      ></CalciteButton>
      <div className="text-slide-div">
        <div className="text-div">
          <p
            style={{ color: `${getTextColor()}` }}
            className="label-text date-text"
            aria-label="Date Text"
          >
            {renderTimePath(timePath.time)}
          </p>
          <p className="label-text now-text">Now</p>
        </div>
        <Slider
          aria-label="Time Slider"
          className="time-slider"
          max={timePathList.length - 1}
          min={0}
          step={1}
          defaultValue={tpIndexRef.current}
          value={tpIndexRef.current}
          onChange={onTimeChange}
        />
      </div>
      <CalciteButton
        title="Next Time"
        iconStart="end-f"
        round
        onClick={onNextTime}
        // disabled={prevDisabled}
        className="play-button"
      ></CalciteButton>
    </div>
  );
};

export default MapDatepicker;
