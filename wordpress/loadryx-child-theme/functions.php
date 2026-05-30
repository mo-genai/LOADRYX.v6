<?php
/**
 * LOADRYX child theme functions.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Enqueue parent + child stylesheets and brand fonts.
 */
function loadryx_enqueue_styles() {
    wp_enqueue_style(
        'storefront-parent',
        get_template_directory_uri() . '/style.css'
    );

    wp_enqueue_style(
        'loadryx-child',
        get_stylesheet_directory_uri() . '/style.css',
        array( 'storefront-parent' ),
        wp_get_theme()->get( 'Version' )
    );

    wp_enqueue_style(
        'loadryx-fonts',
        'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700;800;900&display=swap',
        array(),
        null
    );
}
add_action( 'wp_enqueue_scripts', 'loadryx_enqueue_styles' );

/**
 * Saudi Riyal currency.
 */
function loadryx_add_sar_currency( $currencies ) {
    $currencies['SAR'] = __( 'Saudi Riyal', 'loadryx' );
    return $currencies;
}
add_filter( 'woocommerce_currencies', 'loadryx_add_sar_currency' );

function loadryx_sar_symbol( $currency_symbol, $currency ) {
    if ( $currency === 'SAR' ) {
        return 'ر.س';
    }
    return $currency_symbol;
}
add_filter( 'woocommerce_currency_symbol', 'loadryx_sar_symbol', 10, 2 );

/**
 * Force RTL on the front end (the site is Arabic-first).
 */
function loadryx_force_rtl( $classes ) {
    $classes[] = 'rtl';
    return $classes;
}
add_filter( 'body_class', 'loadryx_force_rtl' );

/**
 * Storefront layout tweaks.
 */
add_filter( 'storefront_credit_links_output', '__return_false' );

function loadryx_footer_credit() {
    echo '<div style="text-align:center;color:#8FA2B6;padding:14px 0;">';
    echo '&copy; ' . date( 'Y' ) . ' LOADRYX — كل الحقوق محفوظة.';
    echo '</div>';
}
add_action( 'storefront_footer', 'loadryx_footer_credit', 50 );
