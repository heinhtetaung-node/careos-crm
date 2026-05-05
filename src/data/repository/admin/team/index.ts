import TeamsCloud from './cloud';

export default class TeamsRepository {
  setTeamCloud = (payload: { [key: string]: number | string | boolean }) => {
    return TeamsCloud.getTeams(payload);
  };
}
