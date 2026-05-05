import * as Yup from 'yup';

const searchOrder = Yup.object().shape({
  search: Yup.object().shape({}),
  date: Yup.object().shape({}),
});

export default {
  searchOrder,
};
