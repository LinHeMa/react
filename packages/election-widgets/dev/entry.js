import 'regenerator-runtime/runtime'
import React from 'react' // eslint-disable-line
import widgets from '../src'
import { createRoot } from 'react-dom/client'

const seatChartRoot = createRoot(document.getElementById('seat-chart'))
const votesComparisonRoot = createRoot(
  document.getElementById('votes-comparison')
)

async function renderSeatChart() {
  const ldr = new widgets.SeatChart.DataLoader({
    apiUrl: 'https://whoareyou-gcs.readr.tw/elections-dev',
  })

  const data = await ldr.loadCouncilMemberData({
    year: '2018',
    countyCode: '63000',
  })

  seatChartRoot.render(
    <>
      <widgets.SeatChart.ReactComponent
        data={data}
        meta={{
          year: '2018',
          location: '台北市',
          componentTitle: '席次圖',
        }}
      />
    </>
  )
}

async function renderVotesComparison() {
  const ldr = new widgets.VotesComparison.DataLoader({
    apiUrl: 'https://whoareyou-gcs.readr.tw/elections-dev',
    version: 'v2',
  })

  const data = await ldr.loadRecallData({
    year: '2025',
    recallType: 'recall',
    district: 'taipeiCity',
  })

  votesComparisonRoot.render(
    <>
      <widgets.VotesComparison.ReactComponent
        election={typeof data === 'object' && data}
      />
    </>
  )
}

renderSeatChart()
renderVotesComparison()
