import ImportCloud from './cloud';

export default class ImportFileRepository {
  importCSV = (payload: any) => {
    return ImportCloud.importCSV(payload);
  };
}
