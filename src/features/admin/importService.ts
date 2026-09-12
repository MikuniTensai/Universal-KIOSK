import { ImportPackage } from '../../domain/types';
import { validateImportPackage, ValidationResult } from '../../domain/validation';
import { computePackageHash } from '../../domain/hash';

export interface PackagePreviewSummary {
  datasetVersion: number;
  sourceName: string;
  sourceAt: string;
  packageHash: string;
  categoryCount: number;
  materialCount: number;
  assetCount: number;
  locationCount: number;
  stockSnapshotCount: number;
  contentCount: number;
}

export class ImportService {
  /**
   * Parse JSON string and validate as an ImportPackage
   */
  public static async parseAndValidate(
    rawJson: string | Record<string, unknown>,
    activePackage?: ImportPackage | null
  ): Promise<{
    pkg: ImportPackage | null;
    validation: ValidationResult;
    preview?: PackagePreviewSummary;
  }> {
    let parsed: any;
    try {
      parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
    } catch (e: any) {
      return {
        pkg: null,
        validation: {
          isValid: false,
          errors: [{ field: 'root', code: 'JSON_SYNTAX_ERROR', message: `Format JSON tidak valid: ${e.message}` }],
          warnings: [],
        },
      };
    }

    // Auto compute packageHash if absent
    if (!parsed.packageHash) {
      parsed.packageHash = await computePackageHash(parsed);
    }

    const validation = validateImportPackage(parsed as ImportPackage, activePackage);

    if (!validation.isValid) {
      return {
        pkg: parsed as ImportPackage,
        validation,
      };
    }

    const preview: PackagePreviewSummary = {
      datasetVersion: parsed.datasetVersion,
      sourceName: parsed.sourceName,
      sourceAt: parsed.sourceAt,
      packageHash: parsed.packageHash,
      categoryCount: parsed.categories?.length || 0,
      materialCount: parsed.materials?.length || 0,
      assetCount: parsed.assets?.length || 0,
      locationCount: parsed.locations?.length || 0,
      stockSnapshotCount: parsed.stockSnapshots?.length || 0,
      contentCount: parsed.contentItems?.length || 0,
    };

    return {
      pkg: parsed as ImportPackage,
      validation,
      preview,
    };
  }
}
