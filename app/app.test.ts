namespace $ {

	function app_make( $: $ ) {
		const app = $bog_microtodo_app.make({ $ }) as $$.$bog_microtodo_app
		new $mol_wire_atom( 'bog_microtodo_test_keep', ()=> app.home() ).fresh()
		app.search( '' )
		app.task_id( null )
		app.list_id( 'inbox' )
		return app
	}

	function list_make( app: $$.$bog_microtodo_app, title: string ) {
		app.list_title_new( title )
		app.list_add()
		return app.list_id()
	}

	function task_make( app: $$.$bog_microtodo_app, list: string, title: string ) {
		app.task_title_new( list, title )
		app.task_add( list )
		return app.list_open( list )[0]
	}

	async function publish( app: $$.$bog_microtodo_app, title: string ) {
		const shared = await $mol_wire_async( app ).list_publish( list_make( app, title ) )
		new $mol_wire_atom( 'bog_microtodo_test_shared', ()=> app.list_land( shared ) ).fresh()
		return shared
	}

	async function wire( from: $giper_baza_land, to: $giper_baza_land ) {
		const net = {
			pack() {
				return $giper_baza_pack.make( from.diff_parts() ).asArray().slice()
			},
			apply( parts: $giper_baza_pack_parts ) {
				for( const [ , part ] of parts ) to.diff_apply( part.units )
			},
		}
		const bin = await $mol_wire_async( net ).pack()
		await $mol_wire_async( net ).apply( $giper_baza_pack.from( bin ).parts() )
	}

	async function guest_join( $: $, app: $$.$bog_microtodo_app, shared: string ) {
		const land = app.list_land( shared )
		const key = app.invite_key( shared )
		const guest = await $mol_wire_async( $.$giper_baza_auth ).grab()
		const copy = $giper_baza_land.make({ $, link: ()=> land.link(), auth: ()=> guest })
		await wire( land, copy )
		const ops = {
			accept() {
				$bog_microtodo_invite.accept( copy, key, guest.pass() )
			},
			title() {
				return copy.Data( $bog_microtodo_list ).Title()?.val() ?? ''
			},
		}
		return { land, guest, copy, ops }
	}

	$mol_test({

		'new list opens and shows up in the menu'( $ ) {
			const app = app_make( $ )
			const list = list_make( app, 'Покупки' )

			$mol_assert_equal( app.list_title( list ), 'Покупки' )
			$mol_assert_equal( app.list_links().includes( app.List_link( list ) ), true )
			$mol_assert_equal( app.pages()[1], app.List_page( list ) )
			$mol_assert_equal( app.list_head( list )[0], app.List_title_field( list ) )
		},

		'task is added on top and moves to finished when done'( $ ) {
			const app = app_make( $ )
			const list = list_make( app, 'Дом' )

			$mol_assert_equal( app.Add_submit( list ).enabled(), false )
			app.Add_title( list ).value( 'Молоко' )
			$mol_assert_equal( app.Add_submit( list ).enabled(), true )
			app.Add_submit( list ).click()
			const milk = app.list_open( list )[0]
			$mol_assert_equal( app.Add_title( list ).value(), '' )
			const bread = task_make( app, list, 'Хлеб' )
			$mol_assert_equal( app.task_rows( list ), [ app.Row( bread ), app.Row( milk ) ] )
			$mol_assert_equal( app.list_count( list ), 2 )
			$mol_assert_equal( app.Row( milk ).title(), 'Молоко' )
			$mol_assert_equal( app.list_body( list ).includes( app.Finished( list ) ), false )

			app.Row( milk ).done( true )
			$mol_assert_equal( app.task_rows( list ), [ app.Row( bread ) ] )
			$mol_assert_equal( app.finished_rows( list ), [ app.Row( milk ) ] )
			$mol_assert_equal( app.finished_title( list ), 'Завершённые 1' )
			$mol_assert_equal( app.list_body( list ).includes( app.Finished( list ) ), true )
		},

		'smart lists collect tasks added from them'( $ ) {
			const app = app_make( $ )

			const sunny = task_make( app, 'myday', 'Позвонить' )
			$mol_assert_equal( app.list_open( 'myday' ).includes( sunny ), true )
			$mol_assert_equal( app.list_open( 'inbox' ).includes( sunny ), true )
			$mol_assert_equal( app.task_myday( sunny ), true )

			const star = task_make( app, 'important', 'Отчёт' )
			$mol_assert_equal( app.list_open( 'important' ).includes( star ), true )
			$mol_assert_equal( app.Row( star ).important(), true )

			const due = task_make( app, 'planned', 'Врач' )
			$mol_assert_equal( app.list_open( 'planned' ).includes( due ), true )
			$mol_assert_equal( app.Details( due ).due(), $bog_microtodo_day() )
			$mol_assert_equal( app.Row( due ).meta_text().includes( 'Сегодня' ), true )

			$mol_assert_equal( app.task_owner().get( star ), 'inbox' )

			const list = list_make( app, 'Учёба' )
			const lesson = task_make( app, list, 'Конспект' )
			app.Row( lesson ).important( true )
			app.list_id( 'important' )
			$mol_assert_equal( app.list_open( 'important' ).includes( lesson ), true )
			$mol_assert_equal( app.task_list_title( lesson ), 'Учёба' )
			app.list_id( list )
			$mol_assert_equal( app.task_list_title( lesson ), '' )
		},

		'details edit title, steps and my day'( $ ) {
			const app = app_make( $ )
			const list = list_make( app, 'Работа' )
			const task = task_make( app, list, 'Черновик' )

			app.task_id( task )
			$mol_assert_equal( app.pages()[2], app.Details( task ) )

			const details = app.Details( task ) as $$.$bog_microtodo_details
			details.title( 'Чистовик' )
			$mol_assert_equal( app.Row( task ).title(), 'Чистовик' )

			details.step_title_new( 'Вступление' )
			details.step_add()
			details.step_title_new( 'Выводы' )
			details.step_add()
			$mol_assert_equal( details.step_rows().length, 2 )
			details.step_done( details.step_ids()[0], true )
			$mol_assert_equal( app.Row( task ).meta_text().includes( '1 из 2' ), true )

			details.myday( true )
			$mol_assert_equal( app.list_open( 'myday' ).includes( task ), true )

			details.drop()
			$mol_assert_equal( app.list_tasks( list ).length, 0 )
			$mol_assert_equal( app.task_id(), '' )
		},

		'repeating task spawns the next one when done'( $ ) {
			const app = app_make( $ )
			const list = list_make( app, 'Привычки' )
			const task = task_make( app, list, 'Зарядка' )

			app.Details( task ).due( '2026-11-17' )
			app.Details( task ).repeat( 'day' )
			app.task_done( task, true )

			const next = app.list_open( list )
			$mol_assert_equal( next.length, 1 )
			$mol_assert_unique( next[0], task )
			$mol_assert_equal( app.task_due( next[0] ), '2026-11-18' )
			$mol_assert_equal( app.Details( next[0] ).repeat(), 'day' )
		},

		'due dates roll by repeat rule'() {
			$mol_assert_equal( $bog_microtodo_due_next( '2026-11-20', 'weekday' ), '2026-11-23' )
			$mol_assert_equal( $bog_microtodo_due_next( '2026-01-31', 'week' ), '2026-02-07' )
			$mol_assert_equal( $bog_microtodo_due_next( '2026-11-17', 'year' ), '2027-11-17' )
			$mol_assert_equal( $bog_microtodo_due_next( '2026-11-17', '' ), '' )
		},

		'search finds tasks across lists'( $ ) {
			const app = app_make( $ )
			const list = list_make( app, 'Поездка' )
			const task = task_make( app, list, 'Паспорт уникальный' )

			app.search( 'уникальный' )
			$mol_assert_equal( app.list_current(), 'search' )
			$mol_assert_equal( app.list_open( 'search' ), [ task ] )
			$mol_assert_equal( app.pages()[1], app.List_page( 'search' ) )
			app.search( '' )
		},

		'invite link adds shared list once'( $ ) {
			const app = app_make( $ )
			const list = list_make( app, 'Общий' )
			app.list_drop( list )
			$mol_assert_equal( app.list_ids().includes( list ), false )

			app.$.$mol_state_arg.value( 'join', list )
			app.join_apply()
			app.join_apply()
			$mol_assert_equal( app.list_ids().filter( id => id === list ).length, 1 )
			$mol_assert_equal( app.list_id(), list )
		},

		async 'owner adds a member by key and the member reads the encrypted list'( $ ) {
			const app = app_make( $ )
			const list = list_make( app, 'Ремонт' )
			task_make( app, list, 'Купить краску' )
			const shared = await $mol_wire_async( app ).list_publish( list )
			const land = app.list_land( shared )

			$mol_assert_equal( land.encrypted(), true )
			$mol_assert_equal( app.list_owned( shared ), true )
			$mol_assert_equal( app.share_content( shared ).includes( app.Rights( shared ) ), true )
			$mol_assert_equal( app.lands_owned(), [ land ] )

			const friend = await $mol_wire_async( $.$giper_baza_auth ).grab()
			const rights = app.Rights( shared ) as $$.$bog_microtodo_rights
			const ops = {
				add() {
					rights.add_key( friend.pass().toString() )
					rights.add_commit()
					rights.gift_tier( friend.pass().lord(), 'post' )
				},
			}
			await $mol_wire_async( ops ).add()
			$mol_assert_equal( land.lord_rank( friend.pass().lord() ), $giper_baza_rank_post( 'just' ) )
			$mol_assert_equal( rights.gifts().includes( rights.Gift( friend.pass().lord() ) ), true )

			const copy = $giper_baza_land.make({ $, link: ()=> land.link(), auth: ()=> friend })
			const send = {
				pack() {
					return $giper_baza_pack.from( $giper_baza_pack.make( land.diff_parts() ).asArray().slice() )
				},
			}
			const wire = await $mol_wire_async( send ).pack()
			const read = {
				title() {
					for( const [ , part ] of wire.parts() ) copy.diff_apply( part.units )
					const data = copy.Data( $bog_microtodo_list )
					const task = copy.Pawn( $bog_microtodo_task ).Head( data.Tasks()!.items()[0].head() )
					return [ data.Title()?.val(), task.Title()?.val() ]
				},
			}
			$mol_assert_equal( await $mol_wire_async( read ).title(), [ 'Ремонт', 'Купить краску' ] )
		},

		async 'guest with invite link becomes a member without the owner'( $ ) {
			const app = app_make( $ )
			const shared = await publish( app, 'Поход' )

			$mol_assert_equal( app.share_link( shared ).includes( 'invite=' ), true )
			$mol_assert_equal( app.invite_tools( shared ), [ app.Share_copy( shared ), app.Invite_renew( shared ), app.Invite_close( shared ) ] )

			const { land, guest, copy, ops } = await guest_join( $, app, shared )
			await $mol_wire_async( ops ).accept()
			$mol_assert_equal( await $mol_wire_async( ops ).title(), 'Поход' )

			await wire( copy, land )
			$mol_assert_equal( land.lord_rank( guest.pass().lord() ), $giper_baza_rank_post( 'just' ) )
			const rights = app.Rights( shared ) as $$.$bog_microtodo_rights
			$mol_assert_equal( rights.gifts().includes( rights.Gift( guest.pass().lord() ) ), true )
			$mol_assert_equal( rights.gifts().includes( rights.Gift( new $giper_baza_link( app.invite_hidden( shared )[0] ) ) ), false )
		},

		async 'closed invite link lets nobody in'( $ ) {
			const app = app_make( $ )
			const shared = await publish( app, 'Тайна' )
			const key = app.invite_key( shared )
			await $mol_wire_async( app ).invite_close_run( shared )

			$mol_assert_equal( app.invite_key( shared ), '' )
			$mol_assert_equal( app.invite_tools( shared ), [ app.Invite_renew( shared ) ] )
			$mol_assert_equal( $bog_microtodo_invite_open( app.list_land( shared ), key ), false )

			const land = app.list_land( shared )
			const guest = await $mol_wire_async( $.$giper_baza_auth ).grab()
			const copy = $giper_baza_land.make({ $, link: ()=> land.link(), auth: ()=> guest })
			await wire( land, copy )
			const ops = {
				accept() {
					$bog_microtodo_invite.accept( copy, key, guest.pass() )
				},
			}
			let denied = ''
			try {
				await $mol_wire_async( ops ).accept()
			} catch( error: any ) {
				denied = error.message
			}
			$mol_assert_equal( denied !== '', true )
			$mol_assert_equal( copy.lord_rank( guest.pass().lord() ), $giper_baza_rank_deny )

			await $mol_wire_async( app ).invite_renew_run( shared )
			$mol_assert_equal( app.invite_key( shared ) !== '', true )
			$mol_assert_unique( app.invite_key( shared ), key )
			$mol_assert_equal( app.invite_hidden( shared ).length, 2 )
		},

		async 'shared list copies tasks into its own land'( $ ) {
			const app = app_make( $ )
			const list = list_make( app, 'Семья' )
			const task = task_make( app, list, 'Купить подарок' )
			app.task_myday( task, true )

			const shared = await $mol_wire_async( app ).list_publish( list )

			$mol_assert_equal( app.list_ids().includes( list ), false )
			$mol_assert_equal( app.list_ids().includes( shared ), true )
			$mol_assert_equal( app.list_shared( shared ), true )
			$mol_assert_equal( app.list_title( shared ), 'Семья' )
			$mol_assert_equal( app.list_tools( shared ), [ app.List_drop( shared ) ] )
			$mol_assert_equal( app.list_body( shared ).includes( app.Share( shared ) ), true )
			$mol_assert_equal( app.share_link( shared ).includes( 'join=' ), true )

			const copy = app.list_open( shared )
			$mol_assert_equal( copy.length, 1 )
			$mol_assert_equal( app.Row( copy[0] ).title(), 'Купить подарок' )
			$mol_assert_equal( app.task_myday( copy[0] ), true )
		},

		'settings open instead of lists and close back'( $ ) {
			const app = app_make( $ )

			app.$.$mol_state_arg.value( 'settings', '' )
			$mol_assert_equal( app.pages(), [ app.Menu(), app.Settings() ] )

			app.$.$mol_state_arg.value( 'settings', null )
			$mol_assert_equal( app.pages()[1], app.List_page( 'inbox' ) )
		},

		'account link carries the key and is parsed back'( $ ) {
			const app = app_make( $ )
			const settings = app.Settings() as $$.$bog_microtodo_settings
			const key = settings.account_key()

			$mol_assert_equal( key.length >= 160, true )
			$mol_assert_equal( settings.account_key_of( settings.account_link() ), key )
			$mol_assert_equal( settings.account_key_of( ' ' + key + '\n' ), key )
			$mol_assert_equal( settings.account_key_of( 'https://b-on-g.github.io/microtodo/' ), '' )
			$mol_assert_equal( settings.account_switch( key ), false )
		},

		async 'lists of the previous account move into the current one'( $ ) {
			const app = app_make( $ )
			const shared = await $mol_wire_async( app ).list_publish( list_make( app, 'Чужой общий' ) )
			app.list_drop( shared )

			const ops = {
				land: null as null | $giper_baza_land,
				grab() {
					this.land = $.$giper_baza_glob.land_grab([[ null, $giper_baza_rank_read ]])
					const old = this.land.Data( $bog_microtodo_home )
					const task = old.Inbox( 'auto' )!.make( null )
					task.Title( 'auto' )!.val( 'Старая задача' )
					const list = old.Lists( 'auto' )!.make( null )
					list.Title( 'auto' )!.val( 'Старый список' )
					list.Tasks( 'auto' )!.make( null ).Title( 'auto' )!.val( 'Старый пункт' )
					old.Lists( 'auto' )!.items([ ... old.Lists()!.items(), new $giper_baza_link( shared ) ])
				},
			}
			await $mol_wire_async( ops ).grab()
			new $mol_wire_atom( 'bog_microtodo_test_old', ()=> ops.land!.Data( $bog_microtodo_home ) ).fresh()

			$.$mol_state_local.value( 'bog_microtodo_merge', ops.land!.link().str )
			app.merge_apply()

			$mol_assert_equal( $.$mol_state_local.value( 'bog_microtodo_merge' ), null )
			const titles = app.list_tasks( 'inbox' ).map( task => app.Row( task ).title() )
			$mol_assert_equal( titles.includes( 'Старая задача' ), true )
			$mol_assert_equal( app.list_ids().includes( shared ), true )
			const moved = app.list_ids().find( id => app.list_title( id ) === 'Старый список' )!
			$mol_assert_equal( app.list_shared( moved ), false )
			$mol_assert_equal( app.list_tasks( moved ).map( task => app.Row( task ).title() ), [ 'Старый пункт' ] )
		},

	})

}
