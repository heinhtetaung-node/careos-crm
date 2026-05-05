const orderComments = {
  comments: [
    {
      name: 'Pailin',
      createTime: '2021-11-04T05:52:44.409385Z',
      text: 'k',
    },
    {
      name: 'Jane',
      createTime: '2021-11-03T09:23:10.243705Z',
      text: 'sss',
    },
  ],
  nextPageToken:
    'eyJwIjp7ImMiOiJsZWFkL3YxYWxwaGEyL2xlYWRzLzVjNzgwODBjLTg4NjktNGFhZi04MmU1LTY1MzkzZjUxN2QyMC9jb21tZW50cyIsImsiOnsiU2hvd0RlbGV0ZWQiOmZhbHNlLCJQYWdlU2l6ZSI6NSwiRmlsdGVyIjoiIiwiT3JkZXJCeSI6IiJ9fSwicyI6eyJkIjoiMjAyMS0xMS0wM1QwNzo0MzowOS43NjUxMzlaIiwiaSI6ImY0ODkyN2E4LTc0OTMtNGU1OC1iMjZmLTEyMDFjZTlmNzVmNyJ9fQ==',
};

export const mockOrderCommentsGff = {
  comments: [
    {
      name: 'orders/149e9bce-c2a1-4be8-b4c5-71565ce8fd25/comments/fe00008d-cd8d-499d-ba73-5d32d55e76db',
      createTime: '2023-09-07T09:08:27.342098Z',
      updateTime: '2023-09-07T09:08:27.342098Z',
      deleteTime: null,
      createBy: 'users/5365ce53-74a4-4064-a473-6e75a805f44b',
      text: "QC_STATUS_APPROVED by '' at 07/09/2023 (04:08 PM)",
    },
    {
      name: 'orders/149e9bce-c2a1-4be8-b4c5-71565ce8fd25/comments/084db991-0069-4453-afaf-a531936ba49f',
      createTime: '2023-09-07T09:08:27.194104Z',
      updateTime: '2023-09-07T09:08:27.194104Z',
      deleteTime: null,
      createBy: 'users/27db73d9-701d-491d-9415-092357072978',
      text: "ITEM_QC_STATUS_APPROVED by '' at 07/09/2023 (04:08 PM)",
    },
    {
      name: 'leads/04ed31d8-8fba-4058-a680-4102f85759b2/comments/505fbba4-74c4-4361-863d-6db0fcb34c27',
      createTime: '2023-09-07T09:08:27.154659Z',
      updateTime: '2023-09-07T09:08:27.154659Z',
      deleteTime: null,
      createBy: 'users/25f28891-14bf-4bbf-9219-cbcd3628342c',
      text: 'Order created',
    },
    {
      name: 'orders/149e9bce-c2a1-4be8-b4c5-71565ce8fd25/comments/e8685529-1e88-4f6b-b216-c4bc3a950f47',
      createTime: '2023-09-07T09:08:27.153752Z',
      updateTime: '2023-09-07T09:08:27.153753Z',
      deleteTime: null,
      createBy: 'users/00992db2-6906-4fd1-b7ec-d1c27feed006',
      text: "ITEM_QC_STATUS_APPROVED by '' at 07/09/2023 (04:08 PM)",
    },
    {
      name: 'orders/149e9bce-c2a1-4be8-b4c5-71565ce8fd25/comments/f96dde53-e3c5-4de9-b51f-0576c7636b5e',
      createTime: '2023-09-07T09:08:27.099689Z',
      updateTime: '2023-09-07T09:08:27.099689Z',
      deleteTime: null,
      createBy: '',
      text: "DOCUMENT_STATUS_COMPLETE by '' at 07/09/2023 (04:08 PM)",
    },
  ],
  pageToken: 'eyJwIjoyfQ==',
  nextpageToken: 'eyJwIjoyfQ==',
};

export const mockCommentResponseSlice = [
  {
    selectData: [
      {
        key: 'users/5365ce53-74a4-4064-a473-6e75a805f44b',
        value: 'manager user',
      },
      {
        key: 'users/27db73d9-701d-491d-9415-092357072978',
        value: 'Supervisor last name',
      },
      {
        key: 'users/25f28891-14bf-4bbf-9219-cbcd3628342c',
        value: 'Pattaraton Prangprakhon',
      },
      {
        key: 'users/00992db2-6906-4fd1-b7ec-d1c27feed006',
        value: 'Nutthapoj Snansiang',
      },
    ],
  },
  {
    comments: mockOrderCommentsGff.comments,
  },
  {
    pageToken: mockOrderCommentsGff.pageToken,
  },
];

export default orderComments;
