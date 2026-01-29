#!/usr/bin/env node

import { program } from "commander";
import { login, logout } from "./commands/login.js";
import { list, vaults } from "./commands/list.js";
import { get } from "./commands/get.js";
import { generate } from "./commands/generate.js";
import { run } from "./commands/run.js";
import { agent, add as sshadd, list as sshlist, remove as sshremove, status as sshstatus } from "./commands/ssh.js";

program
  .name("noro")
  .description("cli for noro.sh secret sharing")
  .version("0.0.0");

program
  .command("login")
  .description("authenticate with noro.sh")
  .action(login);

program
  .command("logout")
  .description("remove stored credentials")
  .action(logout);

program
  .command("list")
  .description("list vault items")
  .option("-v, --vault <name>", "filter by vault")
  .action(list);

program
  .command("vaults")
  .description("list vaults")
  .action(vaults);

program
  .command("get <id>")
  .description("get item by id or reference (op://vault/item/field)")
  .option("-f, --field <name>", "output specific field")
  .option("-j, --json", "output as json")
  .action(get);

program
  .command("generate")
  .description("generate a password")
  .option("-l, --length <n>", "password length", "16")
  .option("-n, --numbers", "include numbers")
  .option("-s, --symbols", "include symbols")
  .option("-u, --uppercase", "include uppercase")
  .option("--no-lowercase", "exclude lowercase")
  .action(generate);

program
  .command("run")
  .description("run command with secrets injected into env")
  .argument("<cmd...>", "command to run")
  .allowUnknownOption()
  .action(run);

const ssh = program.command("ssh").description("ssh agent management");

ssh.command("agent").description("start ssh agent").action(agent);

ssh
  .command("add <id>")
  .description("add key to agent from vault or file")
  .option("-f, --file <path>", "load key from file instead of vault")
  .option("-c, --comment <text>", "key comment")
  .option("-a, --approval", "require approval for each signing")
  .option("-t, --ttl <duration>", "key lifetime (e.g. 1h, 30m)")
  .action(sshadd);

ssh.command("list").description("list loaded keys").action(sshlist);

ssh.command("remove <id>").description("remove key from agent").action(sshremove);

ssh.command("status").description("show agent status").action(sshstatus);

program.parse();
