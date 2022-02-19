import { Client } from "@notionhq/client"
import dotenv from "dotenv"
import fetch from "node-fetch"

dotenv.config()

const notionClient = new Client({ auth: process.env.NOTION_KEY })

const databaseId = process.env.NOTION_DATABASE_ID

export class LinkRepo {
  __client = notionClient

  async create(link, name="") {
    const response = await this.__client.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: {
          title:[
            {
              "text": {
                "content": name
              }
            }
          ]
        },
      },
    })
    const itemID = response.id
    const updateResponse = await this.__client.pages.update({
      page_id: itemID,
      properties: {
        URL: {
          "url": link
        }
      }
    })
    return updateResponse
  }

  async listItems(filterArgs) {

    const filter = filterArgs ? {
      checkbox: {
        equals: filterArgs.isChecked,
        property: "checked"
      }
    } : {}

    const res = await this.__client.databases.query({database_id: databaseId, ...filter })
    return res
  }
}

export class AddLink {
  __repo = null
  constructor(repo) {
    this.__repo = repo
  }
  async execute(url) {
    if (!(url.match(/^https:\/\/[0-9a-z]+/))) {
      throw new Error("Invalid URL Pattern")
    }
    try {
      const res = await fetch(url)
      const result = (await res.text()).match(/<title>(.+)<\/title>/)
      const title = result[1]
      const created = await this.__repo.create(url, title)
      console.log("success!! see detail ->", created)
    } catch (error) {
      console.error(error)
    }
  }
}

export class GetUnreadLinks {
  __repo = null
  constructor(repo) {
    this.__repo = repo
  }

  async execute() {
    const items = await this.__repo.listItems({isChecked: false})
    console.log("listItems ->", items)
    return items
  }
}


class Controller {
  _addLink = null
  _getUnreadLink = null

  constructor(addLink, getUnreadLinks) {
    this._addLink = addLink
    this._getUnreadLink = getUnreadLinks
  }

  addLink(url) {
    return this._addLink.execute(url)
  }

  getUnreadLinks() {
    this._getUnreadLink.execute()
  }
}
/**
 *  cli tool
 * TODO: add controller
 *  cloud function
 *
 * TODO: create NoSQL Schema from json file
 */

const newController = () => {
  const repo = new LinkRepo()
  return new Controller(new AddLink(repo), new GetUnreadLinks(repo))
}

export default newController()