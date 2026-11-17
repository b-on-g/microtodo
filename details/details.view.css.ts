namespace $ {

	$mol_style_define( $bog_microtodo_details, {
		flex: {
			basis: '24rem',
			shrink: 0,
		},
		Head: {
			align: {
				items: 'center',
			},
		},
		Title_field: {
			flex: {
				grow: 1,
			},
			font: {
				weight: 'bold',
			},
		},
		Body_content: {
			gap: $mol_gap.block,
		},
		Note: {
			minHeight: '8rem',
		},
		Foot: {
			align: {
				items: 'center',
			},
			color: $mol_theme.shade,
		},
		Created: {
			flex: {
				grow: 1,
			},
			justify: {
				content: 'center',
			},
		},
	} )

}
