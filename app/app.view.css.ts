namespace $ {

	$mol_style_define( $bog_microtodo_app, {
		'--mol_theme_hue': '215deg',
		Menu: {
			flex: {
				basis: '18rem',
				shrink: 0,
			},
		},
		List_page: {
			flex: {
				basis: '32rem',
				grow: 1,
			},
		},
		Add: {
			padding: $mol_gap.block,
		},
		Add_title: {
			flex: {
				grow: 1,
			},
		},
		Share: {
			flex: {
				direction: 'column',
			},
			padding: $mol_gap.block,
		},
		Rows: {
			gap: $mol_gap.space,
			padding: $mol_gap.block,
		},
		Finished: {
			padding: $mol_gap.block,
		},
		List_title_field: {
			flex: {
				grow: 1,
			},
			font: {
				size: '1.5rem',
				weight: 'bold',
			},
		},
	} )

}
