import { TestFormat } from "./src";

/**
 * Main configuration of the exporter - type interface.
 * Default values for it can be set through `config.json`
 * Users can override the behavior when creating the pipelines or by creating `config.local.json` file specifying actual values.
 */
export type ExporterConfiguration = {
  /** When enabled, generate a disclaimer showing the fact that the file was generated automatically and should not be changed manually will appear in all files */
  generateDisclaimer: boolean,
  basePath: string,
  colorPath: string,
  /** When enabled, all color tokens will be combined into a single file instead of creating separate files for each color group */
  createUnifiedColorFile: boolean,
  /** Name of the unified color class (will be validated and formatted according to Dart naming rules). Only used when createUnifiedColorFile is enabled */
  unifiedColorClassName: string,
  typographyPath: string,
  shadowPath: string,
  testFormat: TestFormat,
  customIdentifiers: string[],
}
