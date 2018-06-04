import React from 'react'
import Cid from '../../components/cid/Cid'

const Crumb = ({base, path, node}) => {
  const parts = path.split('/')
  return (
    <div class="dib">

    </div>
  )
}
// do underlines point to the node type the path contains, or the node type that is resovled if you click on it?

// zdpu..zrvSs / favourites / 0 / a / css / main.css
// ========================  ==  ==   ---   -------

// zdpu..zrvSs / favourites / 0 / a / css / main.css
// ============================  ==  ----   --------

/*
[
  {
    path: /ipld/zdpuAs8sJjcmsPUfB1bUViftCZ8usnvs2cXrPH6MDyT4zrvSs
    type: dag-cbor
    links: [
      { name: favourite/0, cid: z2 }
      { name: favourite/1, cid: z3 }
      { name: favourite/2, cid: z4 }
    ],
    next: { name: favourite/0, cid: z2 }
  },
  {
    path: /ipld/zdpuAs8sJjcmsPUfB1bUViftCZ8usnvs2cXrPH6MDyT4zrvSs/favourites/0
    type: dag-cor
    cid: z2
    links: [
      { name: a, cid: z5 }
    ],
    next: { name: a, cid: z5 }
  },
  {
    path: /ipld/zdpuAs8sJjcmsPUfB1bUViftCZ8usnvs2cXrPH6MDyT4zrvSs/favourites/0/a
    type: dag-cor
    cid: z5
    links: [
      { name: css, cid: Qm1 }
      { name: js, cid: Qm2 }
      { name: index.html, cid: Qm3 }
    ],
    next: { name: css, cid: Qm1 }
  },
  {
    path: /ipld/zdpuAs8sJjcmsPUfB1bUViftCZ8usnvs2cXrPH6MDyT4zrvSs/favourites/0/a/css
    type: dag-pb
    cid: Qm1
    links: [
      { name: main.css, cid: Qm4 }
    ],
  }
}

{
  path: /ipfs/zdpuAs8sJjcmsPUfB1bUViftCZ8usnvs2cXrPH6MDyT4zrvSs/favourites/0/a/css,
  pathBoundaries: [
    {
      pathBoundary: zdpuAs8sJjcmsPUfB1bUViftCZ8usnvs2cXrPH6MDyT4zrvSs/favourites/0
      cid: zdpuAs8sJjcmsPUfB1bUViftCZ8usnvs2cXrPH6MDyT4zrvSs
      type: 'dag-cbor'
      data: { ... }
      links: [
        { name: favourite/0, cid: z2 }
        { name: favourite/1, cid: z3 }
        { name: favourite/2, cid: z4 }
      ]
    },
    {
      path: zdpuAs8sJjcmsPUfB1bUViftCZ8usnvs2cXrPH6MDyT4zrvSs/favourites/0/a
      cid: z2
      type: 'dag-cbor'
      links: [
        { name: a, cid: z5 }
      ],
    },
    {
      path: zdpuAs8sJjcmsPUfB1bUViftCZ8usnvs2cXrPH6MDyT4zrvSs/favourites/0/a/css
      cid: Qm1
      type: 'dag-pb'
      links: [
        { name: a, cid: z5 }
      ],
    }
  ]
}

*/

const GraphCrumbs = ({crumbInfo}) => {
  if (!crumbInfo || crumbInfo.length === 0) return null
  const [cid, nodes] = crumbInfo
  return (
    <div>
      <Cid value={cid.value} />
    </div>
  )
}

export default GraphCrumbs
