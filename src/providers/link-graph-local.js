export class LinkGraphLocalProvider {
  constructor({ db = null } = {}) {
    this.id = "local_link_graph";
    this.db = db;
  }

  configured() {
    return Boolean(this.db?.prepare);
  }

  async backlinks(
    domain,
    { limit = 100 } = {},
  ) {
    if (!this.configured()) {
      return {
        ok: false,
        status: "not_ready",
        provider: this.id,
        reason: "dataset_not_configured",
        detail:
          "The local backlink graph is not configured.",
        links: [],
        coverage: {
          available: false,
          totalRecords: 0,
          conclusive: false,
        },
      };
    }

    const normalizedDomain =
      String(domain ?? "")
        .trim()
        .toLowerCase();

    if (!normalizedDomain) {
      return {
        ok: false,
        status: "failed",
        provider: this.id,
        reason: "domain_required",
        links: [],
      };
    }

    try {
      /*
       * First verify whether the local graph
       * contains any backlink data at all.
       *
       * Empty graph != domain has no backlinks.
       */
      const stats =
        await this.db
          .prepare(
            `SELECT
               COUNT(*) AS total_records,
               MAX(last_seen) AS latest_observation
             FROM web_links`,
          )
          .first();

      const totalRecords =
        Number(
          stats?.total_records ?? 0,
        );

      const latestObservation =
        stats?.latest_observation ??
        null;

      if (totalRecords === 0) {
        return {
          ok: false,
          status: "not_ready",
          provider: this.id,
          reason: "dataset_empty",
          detail:
            "The local backlink graph contains no records. " +
            "An empty result cannot be interpreted as evidence that the domain has no backlinks.",
          links: [],

          coverage: {
            mode: "local_accumulated",
            available: false,
            totalRecords: 0,
            latestObservation: null,
            conclusive: false,
          },

          dataset: {
            mode: "local_accumulated",
            estimated: false,
            records: 0,
          },
        };
      }

      const effectiveLimit =
        Math.min(
          500,
          Math.max(
            1,
            Number(limit) || 100,
          ),
        );

      const result =
        await this.db
          .prepare(
            `SELECT
               source_url,
               target_url,
               anchor,
               rel,
               first_seen,
               last_seen
             FROM web_links
             WHERE target_domain = ?
             ORDER BY last_seen DESC
             LIMIT ?`,
          )
          .bind(
            normalizedDomain,
            effectiveLimit,
          )
          .all();

      const links =
        result?.results ?? [];

      return {
        ok: true,
        status: "success",
        provider: this.id,
        links,

        result: {
          matches:
            links.length,

          noMatches:
            links.length === 0,

          conclusiveWithinGraph:
            true,

          interpretation:
            links.length === 0
              ? "No backlinks for this domain were found in the populated local graph. This does not prove that no backlinks exist on the public web."
              : "Backlinks for this domain were found in the local graph.",
        },

        coverage: {
          mode: "local_accumulated",
          available: true,
          totalRecords,
          latestObservation,
          queryConclusiveWithinGraph:
            true,
          internetWideCoverageKnown:
            false,
          queryLimit:
            effectiveLimit,
        },

        dataset: {
          mode: "local_accumulated",
          estimated: false,
          totalRecords,
          matchedRecords:
            links.length,
        },
      };
    } catch (error) {
      return {
        ok: false,
        status: "failed",
        provider: this.id,
        reason: "dataset_query_error",
        detail:
          String(
            error?.message ??
              error,
          ),
        links: [],
      };
    }
  }
}
