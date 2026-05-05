import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';

import './scvValidation.scss';
import csvValidationErrors from 'shared/helper/csvValidationErrors';

const typeFileResult = {
  fileName: '',
  fileType: '',
  fileSize: 0,
  result: [],
};

interface FileResult {
  fileName: string;
  name: string;
  fileType: string;
  fileSize: number;
  result: any[];
}

interface CsvColumnData {
  name: string;
  dataType: string;
}

interface IValidation<T> {
  file: T;
  csvName: string;
  isErrorCheck?: boolean;
  optionalColumns?: string[];
  requiredColumns: string[] | string[][];
  shouldNotHaveColumns?: string[];
  template: string[];
  templateWithType?: CsvColumnData[];
  [key: string]: any;
  checkError: (error: string[]) => void;
}

const CsvValidation: React.FC<IValidation<FileResult>> = forwardRef(
  (
    {
      file = typeFileResult,
      template,
      isErrorCheck = false,
      csvName,
      optionalColumns,
      requiredColumns,
      shouldNotHaveColumns,
      templateWithType,
      style,
      checkError,
      maximumUpload,
      importModalType,
    },
    ref: any
  ) => {
    const [errorMessages, setErrorMessages]: any = useState([]);
    useEffect(() => {
      const errors = csvValidationErrors({
        file,
        template,
        isErrorCheck,
        csvName,
        optionalColumns,
        requiredColumns,
        shouldNotHaveColumns,
        templateWithType,
        maximumUpload,
        importModalType,
      });
      setErrorMessages(errors);
      checkError(errors);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    const callBackChild = () =>
      // Some body can call this function if need more logic;
      errorMessages;
    useImperativeHandle(ref, () => ({
      callBackChild,
      errors: errorMessages,
    }));
    return (
      isErrorCheck &&
      errorMessages.length > 0 &&
      errorMessages.map((errors: any, _index: number) => (
        <li className="text-error text-left ml-6" key={errors} style={style}>
          {errors}
        </li>
      ))
    );
  }
);

export default CsvValidation;
