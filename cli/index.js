// https://github.com/tj/commander.js/
import { program } from "commander";
import { LinkRepo, AddLink, GetUnreadLinks } from "notion-link";

class CliTool {
  // _addLink = null
  // _getUnreadLinks = null

  constructor(addLink, getUnreadLinks) {
    this._addLink = addLink;
    this._getUnreadLinks = getUnreadLinks;
  }

  async addLink(url, description) {
    const res = await this._addLink.execute(url);
    console.log(res);
  }

  async getLinks(retreiveOnlyUnchecked = true) {
    const res = await this._getUnreadLinks.execute(retreiveOnlyUnchecked)
    console.log(res)
  }
}

const repo = new LinkRepo();
const cliTool = new CliTool(new AddLink(repo), new GetUnreadLinks(repo));

program.name("notion-link");

program
  .command("add")
  .description("add url link")
  .argument("url", "article link to store")
  .option("-d --description <string>", "article description")
  .action((url, options) => {
    if (url.match("^https://") === null) {
      throw new Error("url must be start with https://") // stde
    }
    const description = options.description || "";
    cliTool.addLink(url, description)
  });


program
  .command("get")
  .description("get unchecked link")
  .option("-a --all <boolean>", "should get all articles or not")
  .action((_, options) => {
    const retreiveOnlyUnchecked = !options.all
    cliTool.getLinks(retreiveOnlyUnchecked)
  })


program.parse();



