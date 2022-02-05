import { Client } from "@notionhq/client"
import dotenv from "dotenv"
import fetch from "node-fetch"

dotenv.config()

const notionClient = new Client({ auth: process.env.NOTION_KEY })

const databaseId = process.env.NOTION_DATABASE_ID

class LinkRepo {
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
}

class AddLink {
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

const usecase = new AddLink(new LinkRepo())
async function main() {
  await usecase.execute("https://xaksis.github.io/vue-good-table/guide/advanced/remote-workflow.html#set-mode-to-remote")
}
main()

