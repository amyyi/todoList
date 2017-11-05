import { createValidator, required } from '../../utils/validation';

const validation = createValidator({
  title: [required],
});

export default validation;
