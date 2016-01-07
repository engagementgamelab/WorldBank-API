/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['Engagement Lab API'],
  /**
   * Your New Relic license key.
   */
  license_key: 'ddfb8e2f85f0c72951120b13c52e51cb835f56cd',
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'trace',
    filepath : process.cwd() + '/log/newrelic_agent.log',
  }
}
