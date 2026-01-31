/**
 * UI Component Exports
 */

export { Button, type ButtonProps } from './Button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, type CardProps } from './Card';
export { Input, type InputProps } from './Input';
export { Select, type SelectProps, type SelectOption } from './Select';
export { Slider, type SliderProps } from './Slider';
export { Modal, ModalFooter, type ModalProps } from './Modal';
export { Progress, FrameProgress, type ProgressProps, type FrameProgressProps } from './Progress';
export { ScoreRing, ScoreBadge, type ScoreRingProps, type ScoreBadgeProps } from './ScoreRing';
export { ToastItem, ToastContainer, type ToastProps } from './Toast';

// New Quest Input Components
export {
  ChipSelector,
  ACADEMIC_AWARDS_OPTIONS,
  SPIKE_CATEGORY_OPTIONS,
  MAJOR_OPTIONS,
  type ChipSelectorProps,
  type ChipOption,
} from './ChipSelector';

export {
  SliderInput,
  GPASlider,
  SATSlider,
  ACTSlider,
  HoursSlider,
  type SliderInputProps,
  type SliderMark,
} from './SliderInput';

export {
  VoiceInput,
  BragTextInput,
  ProjectDescriptionInput,
  type VoiceInputProps,
} from './VoiceInput';
