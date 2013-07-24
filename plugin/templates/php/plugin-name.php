<?php
/**
 * The WordPress Plugin Boilerplate.
 *
 * A foundation off of which to build well-documented WordPress plugins
 * that also follow WordPress coding standards and PHP best practices.
 *
 * @package     @@name
 * @description @@description
 * @author      @@author <@@authormail>
 * @license     GPL-2.0+
 * @link        @@url
 * @copyright   @@inceptionyear @@author
 *
 * @wordpress-plugin
 *
 * Plugin Name: @@name
 * Plugin URI:  @@homepage
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

// TODO: replace `class-plugin-name.php` with the name of the actual plugin's class file
require_once( plugin_dir_path( __FILE__ ) . 'class-plugin-name.php' );

// Register hooks that are fired when the plugin is activated, deactivated, and uninstalled, respectively.
// TODO: replace Plugin_Name with the name of the plugin defined in `class-plugin-name.php`
register_activation_hook( __FILE__, array( 'Plugin_Name', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Plugin_Name', 'deactivate' ) );

// TODO: replace Plugin_Name with the name of the plugin defined in `class-plugin-name.php`
Plugin_Name::get_instance();

add_action(
    'plugins_loaded',
    array ( Plugin_Name::get_instance(), 'plugin_init' )
);
