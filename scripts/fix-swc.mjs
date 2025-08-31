#!/usr/bin/env node
import { execSync } from 'node:child_process'
import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'))
const nextVersion = (pkg.dependencies && pkg.dependencies.next) || (pkg.devDependencies && pkg.devDependencies.next) || 'latest'

const platform = process.platform // 'darwin' | 'linux' | 'win32'
const arch = process.arch // 'arm64' | 'x64'

const name = (() => {
  if (platform === 'darwin') return arch === 'arm64' ? '@next/swc-darwin-arm64' : '@next/swc-darwin-x64'
  if (platform === 'linux') return arch === 'arm64' ? '@next/swc-linux-arm64-gnu' : '@next/swc-linux-x64-gnu'
  if (platform === 'win32') return arch === 'arm64' ? '@next/swc-win32-arm64-msvc' : '@next/swc-win32-x64-msvc'
  throw new Error(`Unsupported platform: ${platform}/${arch}`)
})()

const version = nextVersion.replace('^','').replace('~','')

console.log(`Installing ${name}@${version} as devDependency...`)
try {
  execSync(`npm i -D ${name}@${version}`, { stdio: 'inherit' })
  console.log('✓ SWC binary installed')
} catch (e) {
  console.error('Failed to install SWC binary automatically.')
  process.exit(1)
}

