<?php
/**
 * The WordPress Plugin Boilerplate.
 *
 * A foundation off of which to build well-documented WordPress plugins
 * that also follow WordPress coding standards and PHP best practices.
 *
 * @package     @@name
 * @description @@description
 * @author      @@author <@@authoremail>
 * @license     GPL-2.0+
 * @link        @@url
 * @copyright   @@inceptionyear @@author
 *
 * @wordpress-plugin
 *
 * Plugin Name: @@name
 * Plugin URI:  @@url
 * Description: @@description
 * Version:     @@version @@timestamp
 * Author:      @@author
 * Author URI:  @@authoruri
 * Text Domain: @@slug
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path: /lang
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

if ( function_exists('spl_autoload_register')) {

    function neutrico_autoload($class) {

    }

    spl_autoload_register('neutrico_autoload');

    require_once( plugin_dir_path( __FILE__ ) . 'class-<%= _.slugify(pluginName) %>.php' );

    register_activation_hook( __FILE__, array( '<%= pluginName.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}).replace(/\s+/g,"_") %>', 'activate' ) );
    register_deactivation_hook( __FILE__, array( '<%= pluginName.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}).replace(/\s+/g,"_") %>', 'deactivate' ) );

    add_action(
        'plugins_loaded',
        array ( <%= pluginName.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}).replace(/\s+/g,"_") %>::get_instance(), 'plugin_init' )
    );

};
