import { Injectable } from '@nestjs/common'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

@Injectable()
export class FrontendService {
  private indexHtml: string | null = null

  getIndexHtml(root: string) {
    if (this.indexHtml !== null) {
      return this.indexHtml
    }

    const indexPath = join(root, 'index.html')

    if (!existsSync(indexPath)) {
      return null
    }

    this.indexHtml = readFileSync(indexPath, 'utf8')

    return this.indexHtml
  }
}
