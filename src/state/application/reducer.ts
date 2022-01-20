import isNumber from 'is-number'
import { createReducer, nanoid } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists/dist/types'
import { ZERO_ADDRESS } from 'sdk'
import {
  setAppManagement,
  retrieveDomainData,
  updateAppData,
  addPopup,
  PopupContent,
  removePopup,
  updateBlockNumber,
  ApplicationModal,
  setOpenModal,
} from './actions'

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export type StorageState = {
  readonly domain: string
  readonly projectName: string
  readonly brandColor: string
  readonly logo: string
  readonly tokenLists: TokenList[]
  readonly navigationLinks: { name: string; source: string }[]
  readonly menuLinks: { name: string; source: string }[]
  readonly socialLinks: string[]
}

export type ApplicationState = {
  readonly appManagement: boolean
  readonly admin: string
  readonly factory: string
  readonly router: string
  readonly storage: string
  readonly pairHash: string
  readonly protocolFee: number | undefined
  readonly totalFee: number | undefined
  readonly allFeeToProtocol: boolean | undefined
  readonly possibleProtocolPercent: number[]
  readonly devFeeSetter: string | undefined
  readonly totalSwaps: number | undefined
  readonly blockNumber: { readonly [chainId: number]: number }
  readonly popupList: PopupList
  readonly openModal: ApplicationModal | null
} & StorageState

const initialState: ApplicationState = {
  appManagement: false,
  admin: '',
  factory: '',
  router: '',
  storage: '',
  pairHash: '',
  protocolFee: undefined,
  totalFee: undefined,
  allFeeToProtocol: undefined,
  possibleProtocolPercent: [],
  devFeeSetter: '',
  totalSwaps: undefined,
  domain: '',
  projectName: '',
  brandColor: '',
  logo: '',
  tokenLists: [],
  navigationLinks: [],
  menuLinks: [],
  socialLinks: [],
  blockNumber: {},
  popupList: [],
  openModal: null,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setAppManagement, (state, action) => {
      const { status } = action.payload

      state.appManagement = status
    })
    .addCase(retrieveDomainData, (state, action) => {
      let {
        admin = '',
        factory = '',
        router = '',
        storageAddr = '',
        pairHash = '',
        protocolFee,
        totalFee,
        allFeeToProtocol,
        possibleProtocolPercent,
        devFeeSetter,
        totalSwaps,
      } = action.payload

      if (admin === ZERO_ADDRESS) admin = ''
      if (factory === ZERO_ADDRESS) factory = ''
      if (router === ZERO_ADDRESS) router = ''
      if (storageAddr === ZERO_ADDRESS) storageAddr = ''
      if (devFeeSetter === ZERO_ADDRESS) devFeeSetter = ''
      if (possibleProtocolPercent?.length)
        state.possibleProtocolPercent = possibleProtocolPercent.map((strN) => Number(strN))

      state.admin = admin
      state.factory = factory
      state.router = router
      state.storage = storageAddr
      state.pairHash = pairHash
      state.devFeeSetter = devFeeSetter

      if (isNumber(protocolFee)) state.protocolFee = Number(protocolFee)
      if (isNumber(totalFee)) state.totalFee = Number(totalFee)
      if (isNumber(totalSwaps)) state.totalSwaps = Number(totalSwaps)
      if (typeof allFeeToProtocol === 'boolean') state.allFeeToProtocol = allFeeToProtocol
    })
    .addCase(updateAppData, (state, action) => {
      const { domain, projectName, brandColor, logo, tokenLists, navigationLinks, menuLinks, socialLinks } =
        action.payload

      state.domain = domain
      state.projectName = projectName
      state.brandColor = brandColor
      state.logo = logo

      if (tokenLists.length) state.tokenLists = tokenLists
      if (navigationLinks.length) state.navigationLinks = navigationLinks
      if (menuLinks.length) state.menuLinks = menuLinks
      if (socialLinks.length) state.socialLinks = socialLinks
    })
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload
    })
    .addCase(addPopup, (state, { payload: { content, key, removeAfterMs = 15000 } }) => {
      state.popupList = (key ? state.popupList.filter((popup) => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ])
    })
    .addCase(removePopup, (state, action) => {
      const { key } = action.payload

      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false
        }
      })
    })
)