const {Command, flags} = require('@oclif/command');
const backup = require('../executer/backup');

class BackupCommand extends Command {
  async run() {
    const {flags} = this.parse(BackupCommand);
    await backup.main(flags.region, flags.userPoolId).catch(error => {
      this.error(error);
      this.exit(1);
    });
    this.log(`target region ${flags.region}
target userPoolId ${flags.userPoolId}
    `);
  }
}

BackupCommand.description = `Describe the command here
...
Extra documentation goes here
`;

BackupCommand.flags = {
  region: flags.string(
    {
      char: 'r',
      description: 'region name',
      default: 'ap-northeast-1',
    },
  ),
  userPoolId: flags.string(
    {
      char: 'u',
      description: 'userPool Id',
    },
  ),
};

module.exports = BackupCommand;