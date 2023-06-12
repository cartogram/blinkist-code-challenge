/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare global {
  namespace App {
      interface Locals {
        variations: String[];
      }
  }
}
