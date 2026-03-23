const changelogData = {
  'IMS-1000': [
    {estado: 'To do', dias: 33.5, inicio: '21/01/2026 18:05', fin: '10/03/2026 12:45'},
    {estado: 'In Process', dias: 0.6, inicio: '10/03/2026 12:45', fin: '11/03/2026 09:03'},
    {estado: 'Blocked', dias: 3, inicio: '11/03/2026 09:03', fin: '16/03/2026 09:13'},
    {estado: 'In Process', dias: 0, inicio: '16/03/2026 09:13', fin: '16/03/2026 09:16'},
    {estado: 'Blocked', dias: 0.2, inicio: '16/03/2026 09:16', fin: '16/03/2026 11:26'},
    {estado: 'In Process', dias: 0.4, inicio: '16/03/2026 11:26', fin: '16/03/2026 14:41'},
    {estado: 'IN TEST DEV', dias: 2.5, inicio: '16/03/2026 14:41', fin: '19/03/2026 09:59'},
    {estado: 'In Test', dias: 0, inicio: '19/03/2026 09:59', fin: '19/03/2026 09:59'},
    {estado: 'Finalizados', dias: 2.8, inicio: '19/03/2026 09:59', fin: 'En curso'}
  ],
  'IMS-1001': [
    {estado: 'To do', dias: 39, inicio: '21/01/2026 18:07', fin: '17/03/2026 16:54'},
    {estado: 'In Process', dias: 4, inicio: '17/03/2026 16:54', fin: 'En curso'}
  ],
  'IMS-1003': [
    {estado: 'To do', dias: 3.4, inicio: '22/01/2026 12:11', fin: '27/01/2026 15:43'},
    {estado: 'In Process', dias: 5.9, inicio: '27/01/2026 15:43', fin: '04/02/2026 15:05'},
    {estado: 'CODE REVIEW', dias: 0.7, inicio: '04/02/2026 15:05', fin: '05/02/2026 12:14'},
    {estado: 'IN TEST DEV', dias: 3.7, inicio: '05/02/2026 12:14', fin: '11/02/2026 09:21'},
    {estado: 'In Test', dias: 3.4, inicio: '11/02/2026 09:21', fin: '16/02/2026 12:54'},
    {estado: 'Test Issues', dias: 0, inicio: '16/02/2026 12:54', fin: '16/02/2026 12:54'},
    {estado: 'In Process', dias: 0.6, inicio: '16/02/2026 12:54', fin: '17/02/2026 09:23'},
    {estado: 'In Test', dias: 2.5, inicio: '17/02/2026 09:23', fin: '19/02/2026 13:49'},
    {estado: 'Finalizados', dias: 22.4, inicio: '19/02/2026 13:49', fin: 'En curso'}
  ],
  'IMS-1007': [
    {estado: 'To do', dias: 9.7, inicio: '22/01/2026 12:42', fin: '05/02/2026 10:25'},
    {estado: 'In Process', dias: 8.1, inicio: '05/02/2026 10:25', fin: '17/02/2026 11:05'},
    {estado: 'To do', dias: 3.2, inicio: '17/02/2026 11:05', fin: '20/02/2026 12:31'},
    {estado: 'In Process', dias: 0.7, inicio: '20/02/2026 12:31', fin: '23/02/2026 09:27'},
    {estado: 'CODE REVIEW', dias: 4.6, inicio: '23/02/2026 09:27', fin: '27/02/2026 14:52'},
    {estado: 'IN TEST DEV', dias: 1.3, inicio: '27/02/2026 14:52', fin: '03/03/2026 08:57'},
    {estado: 'In Test', dias: 0, inicio: '03/03/2026 08:57', fin: '03/03/2026 09:08'},
    {estado: 'Test Issues', dias: 1.1, inicio: '03/03/2026 09:08', fin: '04/03/2026 09:59'},
    {estado: 'In Test', dias: 0.7, inicio: '04/03/2026 09:59', fin: '04/03/2026 16:31'},
    {estado: 'Finalizados', dias: 13.1, inicio: '04/03/2026 16:31', fin: 'En curso'}
  ],
  'IMS-1012': [
    {estado: 'To do', dias: 19.5, inicio: '22/01/2026 12:46', fin: '19/02/2026 08:10'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '19/02/2026 08:10', fin: '19/02/2026 08:10'},
    {estado: 'In Process', dias: 0.2, inicio: '19/02/2026 08:10', fin: '19/02/2026 10:21'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '19/02/2026 10:21', fin: '19/02/2026 10:21'},
    {estado: 'In Process', dias: 0, inicio: '19/02/2026 10:21', fin: '19/02/2026 10:21'},
    {estado: 'Blocked', dias: 0.3, inicio: '19/02/2026 10:21', fin: '19/02/2026 12:59'},
    {estado: 'CODE REVIEW', dias: 3.1, inicio: '19/02/2026 12:59', fin: '24/02/2026 13:59'},
    {estado: 'IN TEST DEV', dias: 0, inicio: '24/02/2026 13:59', fin: '24/02/2026 13:59'},
    {estado: 'CODE REVIEW', dias: 3.1, inicio: '24/02/2026 13:59', fin: '27/02/2026 14:52'},
    {estado: 'IN TEST DEV', dias: 3.4, inicio: '27/02/2026 14:52', fin: '05/03/2026 09:23'},
    {estado: 'In Test', dias: 0.1, inicio: '05/03/2026 09:23', fin: '05/03/2026 09:50'},
    {estado: 'Test Issues', dias: 0.3, inicio: '05/03/2026 09:50', fin: '05/03/2026 12:49'},
    {estado: 'In Test', dias: 0, inicio: '05/03/2026 12:49', fin: '05/03/2026 12:49'},
    {estado: 'Finalizados', dias: 12.5, inicio: '05/03/2026 12:49', fin: 'En curso'}
  ],
  'IMS-1017': [
    {estado: 'To do', dias: 6.7, inicio: '22/01/2026 18:01', fin: '02/02/2026 14:39'},
    {estado: 'In Process', dias: 2.4, inicio: '02/02/2026 14:39', fin: '05/02/2026 09:28'},
    {estado: 'Blocked', dias: 0.7, inicio: '05/02/2026 09:28', fin: '05/02/2026 15:25'},
    {estado: 'CODE REVIEW', dias: 0.2, inicio: '05/02/2026 15:25', fin: '05/02/2026 16:55'},
    {estado: 'In Test', dias: 10, inicio: '05/02/2026 16:55', fin: '19/02/2026 17:47'},
    {estado: 'Test Issues', dias: 1.2, inicio: '19/02/2026 17:47', fin: '23/02/2026 09:35'},
    {estado: 'Finalizados', dias: 20.8, inicio: '23/02/2026 09:35', fin: 'En curso'}
  ],
  'IMS-1023': [
    {estado: 'To do', dias: 35.9, inicio: '26/01/2026 12:57', fin: '17/03/2026 12:23'},
    {estado: 'In Process', dias: 0.5, inicio: '17/03/2026 12:23', fin: '17/03/2026 19:52'},
    {estado: 'Blocked', dias: 1.3, inicio: '17/03/2026 19:52', fin: '19/03/2026 10:20'},
    {estado: 'IN TEST DEV', dias: 2.7, inicio: '19/03/2026 10:20', fin: 'En curso'}
  ],
  'IMS-1027': [
    {estado: 'To do', dias: 0, inicio: '27/01/2026 11:43', fin: '27/01/2026 11:43'},
    {estado: 'Finalizados', dias: 39.6, inicio: '27/01/2026 11:43', fin: 'En curso'}
  ],
  'IMS-1028': [
    {estado: 'To do', dias: 0, inicio: '27/01/2026 11:44', fin: '27/01/2026 11:44'},
    {estado: 'In Process', dias: 39.6, inicio: '27/01/2026 11:44', fin: 'En curso'}
  ],
  'IMS-1033': [
    {estado: 'To do', dias: 7.8, inicio: '29/01/2026 10:34', fin: '10/02/2026 08:50'},
    {estado: 'In Process', dias: 2.8, inicio: '10/02/2026 08:50', fin: '12/02/2026 15:47'},
    {estado: 'CODE REVIEW', dias: 2.5, inicio: '12/02/2026 15:47', fin: '17/02/2026 11:20'},
    {estado: 'Finalizados', dias: 24.6, inicio: '17/02/2026 11:20', fin: 'En curso'}
  ],
  'IMS-1036': [
    {estado: 'To do', dias: 8.6, inicio: '30/01/2026 08:21', fin: '11/02/2026 13:49'},
    {estado: 'In Process', dias: 5.7, inicio: '11/02/2026 13:49', fin: '19/02/2026 10:49'},
    {estado: 'Blocked', dias: 2.9, inicio: '19/02/2026 10:49', fin: '24/02/2026 10:10'},
    {estado: 'In Process', dias: 2, inicio: '24/02/2026 10:10', fin: '26/02/2026 10:00'},
    {estado: 'CODE REVIEW', dias: 0.2, inicio: '26/02/2026 10:00', fin: '26/02/2026 12:13'},
    {estado: 'IN TEST DEV', dias: 6.1, inicio: '26/02/2026 12:13', fin: '06/03/2026 13:10'},
    {estado: 'In Test', dias: 0, inicio: '06/03/2026 13:10', fin: '06/03/2026 13:19'},
    {estado: 'Finalizados', dias: 11.4, inicio: '06/03/2026 13:19', fin: 'En curso'}
  ],
  'IMS-1043': [
    {estado: 'To do', dias: 36.6, inicio: '30/01/2026 11:14', fin: 'En curso'}
  ],
  'IMS-1044': [
    {estado: 'To do', dias: 18.5, inicio: '30/01/2026 12:55', fin: '26/02/2026 08:39'},
    {estado: 'In Process', dias: 0.1, inicio: '26/02/2026 08:39', fin: '26/02/2026 09:18'},
    {estado: 'CODE REVIEW', dias: 1.6, inicio: '26/02/2026 09:18', fin: '27/02/2026 14:23'},
    {estado: 'IN TEST DEV', dias: 3.4, inicio: '27/02/2026 14:23', fin: '05/03/2026 08:35'},
    {estado: 'In Test', dias: 1.3, inicio: '05/03/2026 08:35', fin: '06/03/2026 11:40'},
    {estado: 'Finalizados', dias: 11.6, inicio: '06/03/2026 11:40', fin: 'En curso'}
  ],
  'IMS-1045': [
    {estado: 'To do', dias: 11.5, inicio: '30/01/2026 12:56', fin: '17/02/2026 08:37'},
    {estado: 'In Process', dias: 0.3, inicio: '17/02/2026 08:37', fin: '17/02/2026 10:57'},
    {estado: 'To do', dias: 4.1, inicio: '17/02/2026 10:57', fin: '23/02/2026 12:10'},
    {estado: 'In Process', dias: 0.5, inicio: '23/02/2026 12:10', fin: '23/02/2026 16:59'},
    {estado: 'Blocked', dias: 3.2, inicio: '23/02/2026 16:59', fin: '27/02/2026 10:05'},
    {estado: 'In Process', dias: 0.1, inicio: '27/02/2026 10:05', fin: '27/02/2026 10:40'},
    {estado: 'CODE REVIEW', dias: 0.1, inicio: '27/02/2026 10:40', fin: '27/02/2026 11:13'},
    {estado: 'IN TEST DEV', dias: 2.8, inicio: '27/02/2026 11:13', fin: '04/03/2026 09:00'},
    {estado: 'In Test', dias: 0.9, inicio: '04/03/2026 09:00', fin: '04/03/2026 16:46'},
    {estado: 'Finalizados', dias: 13, inicio: '04/03/2026 16:46', fin: 'En curso'}
  ],
  'IMS-1046': [
    {estado: 'To do', dias: 17.6, inicio: '30/01/2026 12:57', fin: '25/02/2026 09:42'},
    {estado: 'In Process', dias: 0.7, inicio: '25/02/2026 09:42', fin: '25/02/2026 16:03'},
    {estado: 'Blocked', dias: 1.5, inicio: '25/02/2026 16:03', fin: '27/02/2026 11:08'},
    {estado: 'In Process', dias: 0.8, inicio: '27/02/2026 11:08', fin: '02/03/2026 09:19'},
    {estado: 'CODE REVIEW', dias: 1.5, inicio: '02/03/2026 09:19', fin: '03/03/2026 13:27'},
    {estado: 'IN TEST DEV', dias: 4.3, inicio: '03/03/2026 13:27', fin: '09/03/2026 16:23'},
    {estado: 'In Test', dias: 0, inicio: '09/03/2026 16:23', fin: '09/03/2026 16:27'},
    {estado: 'Test Issues', dias: 2.4, inicio: '09/03/2026 16:27', fin: '12/03/2026 10:43'},
    {estado: 'In Process', dias: 0.4, inicio: '12/03/2026 10:43', fin: '12/03/2026 14:37'},
    {estado: 'Test Issues', dias: 0.1, inicio: '12/03/2026 14:37', fin: '12/03/2026 15:20'},
    {estado: 'IN TEST DEV', dias: 0.2, inicio: '12/03/2026 15:20', fin: '12/03/2026 17:38'},
    {estado: 'In Test', dias: 0.03, inicio: '12/03/2026 17:38', fin: '12/03/2026 17:53'},
    {estado: 'Finalizados', dias: 7, inicio: '12/03/2026 17:53', fin: 'En curso'}
  ],
  'IMS-1050': [
    {estado: 'To do', dias: 18.3, inicio: '30/01/2026 13:06', fin: '25/02/2026 16:08'},
    {estado: 'In Process', dias: 0.1, inicio: '25/02/2026 16:08', fin: '25/02/2026 16:37'},
    {estado: 'CODE REVIEW', dias: 1.8, inicio: '25/02/2026 16:37', fin: '27/02/2026 14:23'},
    {estado: 'IN TEST DEV', dias: 0.5, inicio: '27/02/2026 14:23', fin: '02/03/2026 09:45'},
    {estado: 'In Test', dias: 0, inicio: '02/03/2026 09:45', fin: '02/03/2026 09:45'},
    {estado: 'Test Issues', dias: 0.2, inicio: '02/03/2026 09:45', fin: '02/03/2026 11:18'},
    {estado: 'CODE REVIEW', dias: 0.2, inicio: '02/03/2026 11:18', fin: '02/03/2026 13:13'},
    {estado: 'IN TEST DEV', dias: 0.4, inicio: '02/03/2026 13:13', fin: '02/03/2026 18:26'},
    {estado: 'In Test', dias: 0.01, inicio: '02/03/2026 18:26', fin: '02/03/2026 18:32'},
    {estado: 'Finalizados', dias: 15, inicio: '02/03/2026 18:32', fin: 'En curso'}
  ],
  'IMS-1051': [
    {estado: 'To do', dias: 2.7, inicio: '02/02/2026 12:24', fin: '05/02/2026 09:28'},
    {estado: 'In Process', dias: 6.2, inicio: '05/02/2026 09:28', fin: '13/02/2026 11:37'},
    {estado: 'IN TEST DEV', dias: 0, inicio: '13/02/2026 11:37', fin: '13/02/2026 11:56'},
    {estado: 'In Test', dias: 0.8, inicio: '13/02/2026 11:56', fin: '16/02/2026 10:09'},
    {estado: 'Test Issues', dias: 1.4, inicio: '16/02/2026 10:09', fin: '17/02/2026 13:52'},
    {estado: 'IN TEST DEV', dias: 0.5, inicio: '17/02/2026 13:52', fin: '18/02/2026 09:43'},
    {estado: 'In Test', dias: 0.3, inicio: '18/02/2026 09:43', fin: '18/02/2026 12:39'},
    {estado: 'Test Issues', dias: 0.8, inicio: '18/02/2026 12:39', fin: '19/02/2026 10:31'},
    {estado: 'Finalizados', dias: 22.7, inicio: '19/02/2026 10:31', fin: 'En curso'}
  ],
  'IMS-1052': [
    {estado: 'To do', dias: 0.2, inicio: '02/02/2026 14:55', fin: '02/02/2026 17:12'},
    {estado: 'In Process', dias: 0.2, inicio: '02/02/2026 17:12', fin: '03/02/2026 10:14'},
    {estado: 'CODE REVIEW', dias: 1, inicio: '03/02/2026 10:14', fin: '04/02/2026 10:32'},
    {estado: 'In Test', dias: 0.9, inicio: '04/02/2026 10:32', fin: '05/02/2026 09:43'},
    {estado: 'IN TEST DEV', dias: 0.8, inicio: '05/02/2026 09:43', fin: '05/02/2026 16:38'},
    {estado: 'In Test', dias: 3.2, inicio: '05/02/2026 16:38', fin: '11/02/2026 09:14'},
    {estado: 'Test Issues', dias: 0.1, inicio: '11/02/2026 09:14', fin: '11/02/2026 10:10'},
    {estado: 'CODE REVIEW', dias: 2, inicio: '11/02/2026 10:10', fin: '13/02/2026 10:13'},
    {estado: 'In Process', dias: 0.3, inicio: '13/02/2026 10:13', fin: '13/02/2026 13:02'},
    {estado: 'CODE REVIEW', dias: 0.6, inicio: '13/02/2026 13:02', fin: '16/02/2026 09:00'},
    {estado: 'In Test', dias: 2, inicio: '16/02/2026 09:00', fin: '18/02/2026 09:25'},
    {estado: 'Finalizados', dias: 23.8, inicio: '18/02/2026 09:25', fin: 'En curso'}
  ],
  'IMS-1064': [
    {estado: 'To do', dias: 9.5, inicio: '03/02/2026 12:25', fin: '17/02/2026 08:22'},
    {estado: 'In Process', dias: 0, inicio: '17/02/2026 08:22', fin: '17/02/2026 08:28'},
    {estado: 'In Test', dias: 1.1, inicio: '17/02/2026 08:28', fin: '18/02/2026 09:37'},
    {estado: 'Finalizados', dias: 23.8, inicio: '18/02/2026 09:37', fin: 'En curso'}
  ],
  'IMS-1069': [
    {estado: 'To do', dias: 13.4, inicio: '05/02/2026 13:37', fin: '25/02/2026 08:38'},
    {estado: 'In Process', dias: 0, inicio: '25/02/2026 08:38', fin: '25/02/2026 08:38'},
    {estado: 'To do', dias: 18.9, inicio: '25/02/2026 08:38', fin: 'En curso'}
  ],
  'IMS-1071': [
    {estado: 'To do', dias: 1.2, inicio: '06/02/2026 11:18', fin: '09/02/2026 13:19'},
    {estado: 'In Process', dias: 0.8, inicio: '09/02/2026 13:19', fin: '10/02/2026 11:47'},
    {estado: 'Blocked', dias: 2.9, inicio: '10/02/2026 11:47', fin: '13/02/2026 10:56'},
    {estado: 'In Process', dias: 1.3, inicio: '13/02/2026 10:56', fin: '16/02/2026 13:49'},
    {estado: 'Blocked', dias: 0.9, inicio: '16/02/2026 13:49', fin: '17/02/2026 13:12'},
    {estado: 'In Process', dias: 9.4, inicio: '17/02/2026 13:12', fin: '02/03/2026 20:51'},
    {estado: 'Blocked', dias: 1.7, inicio: '02/03/2026 20:51', fin: '04/03/2026 14:07'},
    {estado: 'In Process', dias: 0.9, inicio: '04/03/2026 14:07', fin: '05/03/2026 13:39'},
    {estado: 'Blocked', dias: 6.4, inicio: '05/03/2026 13:39', fin: '16/03/2026 07:48'},
    {estado: 'In Process', dias: 0.2, inicio: '16/03/2026 07:48', fin: '16/03/2026 09:42'},
    {estado: 'Blocked', dias: 5.8, inicio: '16/03/2026 09:42', fin: 'En curso'}
  ],
  'IMS-1072': [
    {estado: 'To do', dias: 10.7, inicio: '06/02/2026 12:13', fin: '23/02/2026 09:28'},
    {estado: 'In Process', dias: 0, inicio: '23/02/2026 09:28', fin: '23/02/2026 09:30'},
    {estado: 'To do', dias: 0.4, inicio: '23/02/2026 09:30', fin: '23/02/2026 13:16'},
    {estado: 'In Process', dias: 2, inicio: '23/02/2026 13:16', fin: '25/02/2026 13:33'},
    {estado: 'CODE REVIEW', dias: 0.6, inicio: '25/02/2026 13:33', fin: '26/02/2026 09:42'},
    {estado: 'Blocked', dias: 0, inicio: '26/02/2026 09:42', fin: '26/02/2026 10:06'},
    {estado: 'In Process', dias: 0.1, inicio: '26/02/2026 10:06', fin: '26/02/2026 11:21'},
    {estado: 'Blocked', dias: 0.1, inicio: '26/02/2026 11:21', fin: '26/02/2026 12:02'},
    {estado: 'IN TEST DEV', dias: 5.2, inicio: '26/02/2026 12:02', fin: '05/03/2026 13:48'},
    {estado: 'In Test', dias: 0.1, inicio: '05/03/2026 13:48', fin: '05/03/2026 14:29'},
    {estado: 'Finalizados', dias: 12.3, inicio: '05/03/2026 14:29', fin: 'En curso'}
  ],
  'IMS-1078': [
    {estado: 'To do', dias: 14.5, inicio: '10/02/2026 12:32', fin: '02/03/2026 20:51'},
    {estado: 'In Process', dias: 4, inicio: '02/03/2026 20:51', fin: '06/03/2026 19:36'},
    {estado: 'Blocked', dias: 1, inicio: '06/03/2026 19:36', fin: '10/03/2026 03:16'},
    {estado: 'In Process', dias: 0.4, inicio: '10/03/2026 03:16', fin: '10/03/2026 11:28'},
    {estado: 'CODE REVIEW', dias: 5.6, inicio: '10/03/2026 11:28', fin: '17/03/2026 16:55'},
    {estado: 'IN TEST DEV', dias: 3.3, inicio: '17/03/2026 16:55', fin: '23/03/2026 10:34'},
    {estado: 'In Test', dias: 0.7, inicio: '23/03/2026 10:34', fin: '23/03/2026 17:02'},
    {estado: 'Finalizados', dias: 0.03, inicio: '23/03/2026 17:02', fin: 'En curso'}
  ],
  'IMS-1079': [
    {estado: 'To do', dias: 0, inicio: '11/02/2026 08:47', fin: '11/02/2026 08:47'},
    {estado: 'In Process', dias: 0, inicio: '11/02/2026 08:47', fin: '11/02/2026 08:49'},
    {estado: 'Blocked', dias: 0, inicio: '11/02/2026 08:49', fin: '11/02/2026 08:49'},
    {estado: 'In Process', dias: 0.1, inicio: '11/02/2026 08:49', fin: '11/02/2026 09:25'},
    {estado: 'Finalizados', dias: 0, inicio: '11/02/2026 09:25', fin: '11/02/2026 09:26'},
    {estado: 'In Test', dias: 4.1, inicio: '11/02/2026 09:26', fin: '17/02/2026 10:37'},
    {estado: 'Finalizados', dias: 24.7, inicio: '17/02/2026 10:37', fin: 'En curso'}
  ],
  'IMS-1080': [
    {estado: 'To do', dias: 18.8, inicio: '11/02/2026 10:12', fin: '09/03/2026 17:26'},
    {estado: 'In Process', dias: 0, inicio: '09/03/2026 17:26', fin: '09/03/2026 17:26'},
    {estado: 'To do', dias: 0.2, inicio: '09/03/2026 17:26', fin: '10/03/2026 09:51'},
    {estado: 'In Process', dias: 0.3, inicio: '10/03/2026 09:51', fin: '10/03/2026 12:45'},
    {estado: 'To do', dias: 0.6, inicio: '10/03/2026 12:45', fin: '11/03/2026 09:03'},
    {estado: 'In Process', dias: 3, inicio: '11/03/2026 09:03', fin: '16/03/2026 09:13'},
    {estado: 'CODE REVIEW', dias: 0.1, inicio: '16/03/2026 09:13', fin: '16/03/2026 09:49'},
    {estado: 'IN TEST DEV', dias: 3, inicio: '16/03/2026 09:49', fin: '19/03/2026 09:59'},
    {estado: 'In Test', dias: 1.9, inicio: '19/03/2026 09:59', fin: '23/03/2026 09:18'},
    {estado: 'Finalizados', dias: 0.9, inicio: '23/03/2026 09:18', fin: 'En curso'}
  ],
  'IMS-1081': [
    {estado: 'To do', dias: 0, inicio: '11/02/2026 11:32', fin: '11/02/2026 11:32'},
    {estado: 'In Process', dias: 2, inicio: '11/02/2026 11:32', fin: '13/02/2026 11:30'},
    {estado: 'Finalizados', dias: 0.8, inicio: '13/02/2026 11:30', fin: '16/02/2026 09:44'},
    {estado: 'In Process', dias: 1, inicio: '16/02/2026 09:44', fin: '17/02/2026 09:23'},
    {estado: 'Finalizados', dias: 24.8, inicio: '17/02/2026 09:23', fin: 'En curso'}
  ],
  'IMS-1082': [
    {estado: 'To do', dias: 0, inicio: '11/02/2026 14:33', fin: '11/02/2026 14:33'},
    {estado: 'In Process', dias: 1.8, inicio: '11/02/2026 14:33', fin: '13/02/2026 13:02'},
    {estado: 'CODE REVIEW', dias: 0.6, inicio: '13/02/2026 13:02', fin: '16/02/2026 09:01'},
    {estado: 'In Test', dias: 2.1, inicio: '16/02/2026 09:01', fin: '18/02/2026 09:30'},
    {estado: 'Finalizados', dias: 23.8, inicio: '18/02/2026 09:30', fin: 'En curso'}
  ],
  'IMS-1084': [
    {estado: 'To do', dias: 0.5, inicio: '12/02/2026 17:23', fin: '13/02/2026 12:26'},
    {estado: 'Finalizados', dias: 26.5, inicio: '13/02/2026 12:26', fin: 'En curso'}
  ],
  'IMS-1087': [
    {estado: 'To do', dias: 2.7, inicio: '13/02/2026 12:41', fin: '18/02/2026 10:03'},
    {estado: 'In Process', dias: 1.7, inicio: '18/02/2026 10:03', fin: '19/02/2026 15:57'},
    {estado: 'Blocked', dias: 2.2, inicio: '19/02/2026 15:57', fin: '24/02/2026 08:54'},
    {estado: 'In Process', dias: 1.1, inicio: '24/02/2026 08:54', fin: '25/02/2026 09:42'},
    {estado: 'Blocked', dias: 1, inicio: '25/02/2026 09:42', fin: '26/02/2026 10:02'},
    {estado: 'In Process', dias: 0.2, inicio: '26/02/2026 10:02', fin: '26/02/2026 12:14'},
    {estado: 'Blocked', dias: 0.8, inicio: '26/02/2026 12:14', fin: '27/02/2026 10:07'},
    {estado: 'In Process', dias: 0, inicio: '27/02/2026 10:07', fin: '27/02/2026 10:07'},
    {estado: 'Blocked', dias: 0.1, inicio: '27/02/2026 10:07', fin: '27/02/2026 10:40'},
    {estado: 'In Process', dias: 0, inicio: '27/02/2026 10:40', fin: '27/02/2026 11:02'},
    {estado: 'CODE REVIEW', dias: 1, inicio: '27/02/2026 11:02', fin: '02/03/2026 11:10'},
    {estado: 'IN TEST DEV', dias: 0.8, inicio: '02/03/2026 11:10', fin: '03/03/2026 09:32'},
    {estado: 'In Test', dias: 0, inicio: '03/03/2026 09:32', fin: '03/03/2026 09:41'},
    {estado: 'IN TEST DEV', dias: 0.9, inicio: '03/03/2026 09:41', fin: '04/03/2026 08:53'},
    {estado: 'In Test', dias: 3, inicio: '04/03/2026 08:53', fin: '09/03/2026 08:45'},
    {estado: 'Finalizados', dias: 10.9, inicio: '09/03/2026 08:45', fin: 'En curso'}
  ],
  'IMS-1089': [
    {estado: 'To do', dias: 5.6, inicio: '13/02/2026 12:46', fin: '23/02/2026 09:30'},
    {estado: 'In Process', dias: 0.4, inicio: '23/02/2026 09:30', fin: '23/02/2026 13:15'},
    {estado: 'CODE REVIEW', dias: 4.2, inicio: '23/02/2026 13:15', fin: '27/02/2026 14:52'},
    {estado: 'IN TEST DEV', dias: 0.4, inicio: '27/02/2026 14:52', fin: '02/03/2026 09:45'},
    {estado: 'In Test', dias: 0, inicio: '02/03/2026 09:45', fin: '02/03/2026 09:56'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '02/03/2026 09:56', fin: '02/03/2026 10:06'},
    {estado: 'IN TEST DEV', dias: 0.8, inicio: '02/03/2026 10:06', fin: '02/03/2026 18:13'},
    {estado: 'In Test', dias: 0, inicio: '02/03/2026 18:13', fin: '03/03/2026 08:22'},
    {estado: 'Finalizados', dias: 15, inicio: '03/03/2026 08:22', fin: 'En curso'}
  ],
  'IMS-1090': [
    {estado: 'To do', dias: 1.8, inicio: '13/02/2026 12:51', fin: '17/02/2026 10:58'},
    {estado: 'In Process', dias: 0.2, inicio: '17/02/2026 10:58', fin: '17/02/2026 12:26'},
    {estado: 'CODE REVIEW', dias: 0.7, inicio: '17/02/2026 12:26', fin: '18/02/2026 09:52'},
    {estado: 'In Test', dias: 0, inicio: '18/02/2026 09:52', fin: '18/02/2026 10:12'},
    {estado: 'IN TEST DEV', dias: 2, inicio: '18/02/2026 10:12', fin: '20/02/2026 10:07'},
    {estado: 'In Test', dias: 0.6, inicio: '20/02/2026 10:07', fin: '20/02/2026 15:12'},
    {estado: 'Blocked', dias: 0.4, inicio: '20/02/2026 15:12', fin: '23/02/2026 09:43'},
    {estado: 'Test Issues', dias: 0.5, inicio: '23/02/2026 09:43', fin: '23/02/2026 13:54'},
    {estado: 'Finalizados', dias: 20.3, inicio: '23/02/2026 13:54', fin: 'En curso'}
  ],
  'IMS-1092': [
    {estado: 'To do', dias: 0.7, inicio: '16/02/2026 11:53', fin: '17/02/2026 09:33'},
    {estado: 'In Process', dias: 0.1, inicio: '17/02/2026 09:33', fin: '17/02/2026 10:20'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '17/02/2026 10:20', fin: '17/02/2026 10:32'},
    {estado: 'IN TEST DEV', dias: 0.8, inicio: '17/02/2026 10:32', fin: '18/02/2026 08:38'},
    {estado: 'Finalizados', dias: 23.9, inicio: '18/02/2026 08:38', fin: 'En curso'}
  ],
  'IMS-1093': [
    {estado: 'To do', dias: 0, inicio: '16/02/2026 13:50', fin: '16/02/2026 13:50'},
    {estado: 'In Process', dias: 0.9, inicio: '16/02/2026 13:50', fin: '17/02/2026 13:10'},
    {estado: 'CODE REVIEW', dias: 1.5, inicio: '17/02/2026 13:10', fin: '19/02/2026 09:03'},
    {estado: 'IN TEST DEV', dias: 0, inicio: '19/02/2026 09:03', fin: '19/02/2026 09:03'},
    {estado: 'In Test', dias: 1.2, inicio: '19/02/2026 09:03', fin: '20/02/2026 10:41'},
    {estado: 'Finalizados', dias: 21.7, inicio: '20/02/2026 10:41', fin: 'En curso'}
  ],
  'IMS-1094': [
    {estado: 'To do', dias: 0, inicio: '16/02/2026 20:02', fin: '16/02/2026 20:03'},
    {estado: 'In Test', dias: 0.3, inicio: '16/02/2026 20:03', fin: '17/02/2026 10:50'},
    {estado: 'Finalizados', dias: 24.7, inicio: '17/02/2026 10:50', fin: 'En curso'}
  ],
  'IMS-1098': [
    {estado: 'To do', dias: 1.6, inicio: '18/02/2026 10:31', fin: '19/02/2026 16:12'},
    {estado: 'In Process', dias: 0.4, inicio: '19/02/2026 16:12', fin: '20/02/2026 11:07'},
    {estado: 'To do', dias: 1.6, inicio: '20/02/2026 11:07', fin: '23/02/2026 16:38'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '23/02/2026 16:38', fin: '23/02/2026 16:38'},
    {estado: 'To do', dias: 1, inicio: '23/02/2026 16:38', fin: '24/02/2026 16:24'},
    {estado: 'In Process', dias: 1.3, inicio: '24/02/2026 16:24', fin: '26/02/2026 10:25'},
    {estado: 'To do', dias: 1.8, inicio: '26/02/2026 10:25', fin: '02/03/2026 08:38'},
    {estado: 'In Process', dias: 3.4, inicio: '02/03/2026 08:38', fin: '05/03/2026 12:36'},
    {estado: 'Blocked', dias: 0.3, inicio: '05/03/2026 12:36', fin: '05/03/2026 14:54'},
    {estado: 'In Process', dias: 0.6, inicio: '05/03/2026 14:54', fin: '06/03/2026 11:41'},
    {estado: 'Blocked', dias: 3, inicio: '06/03/2026 11:41', fin: '11/03/2026 11:19'},
    {estado: 'In Process', dias: 0.2, inicio: '11/03/2026 11:19', fin: '11/03/2026 13:05'},
    {estado: 'Blocked', dias: 2.6, inicio: '11/03/2026 13:05', fin: '16/03/2026 09:43'},
    {estado: 'In Process', dias: 0.1, inicio: '16/03/2026 09:43', fin: '16/03/2026 10:45'},
    {estado: 'Blocked', dias: 0.1, inicio: '16/03/2026 10:45', fin: '16/03/2026 11:14'},
    {estado: 'In Process', dias: 0.2, inicio: '16/03/2026 11:14', fin: '16/03/2026 12:38'},
    {estado: 'Blocked', dias: 0.9, inicio: '16/03/2026 12:38', fin: '17/03/2026 11:18'},
    {estado: 'CODE REVIEW', dias: 0.9, inicio: '17/03/2026 11:18', fin: '18/03/2026 10:00'},
    {estado: 'IN TEST DEV', dias: 1.9, inicio: '18/03/2026 10:00', fin: '20/03/2026 08:50'},
    {estado: 'Finalizados', dias: 1.9, inicio: '20/03/2026 08:50', fin: 'En curso'}
  ],
  'IMS-1115': [
    {estado: 'To do', dias: 0, inicio: '25/02/2026 17:30', fin: '26/02/2026 07:16'},
    {estado: 'In Process', dias: 0.06, inicio: '26/02/2026 07:16', fin: '26/02/2026 07:51'},
    {estado: 'CODE REVIEW', dias: 1.7, inicio: '26/02/2026 07:51', fin: '27/02/2026 14:23'},
    {estado: 'IN TEST DEV', dias: 0.5, inicio: '27/02/2026 14:23', fin: '02/03/2026 09:29'},
    {estado: 'In Test', dias: 0, inicio: '02/03/2026 09:29', fin: '02/03/2026 09:33'},
    {estado: 'Test Issues', dias: 3.4, inicio: '02/03/2026 09:33', fin: '05/03/2026 13:02'},
    {estado: 'CODE REVIEW', dias: 0.2, inicio: '05/03/2026 13:02', fin: '05/03/2026 14:46'},
    {estado: 'IN TEST DEV', dias: 0.1, inicio: '05/03/2026 14:46', fin: '05/03/2026 15:16'},
    {estado: 'In Test', dias: 0, inicio: '05/03/2026 15:16', fin: '05/03/2026 15:19'},
    {estado: 'Finalizados', dias: 12.2, inicio: '05/03/2026 15:19', fin: 'En curso'}
  ],
  'IMS-1116': [
    {estado: 'To do', dias: 5, inicio: '26/02/2026 09:24', fin: '05/03/2026 09:43'},
    {estado: 'In Process', dias: 0.1, inicio: '05/03/2026 09:43', fin: '05/03/2026 10:36'},
    {estado: 'To do', dias: 0.3, inicio: '05/03/2026 10:36', fin: '05/03/2026 13:37'},
    {estado: 'In Process', dias: 0.5, inicio: '05/03/2026 13:37', fin: '06/03/2026 08:59'},
    {estado: 'To do', dias: 0.7, inicio: '06/03/2026 08:59', fin: '06/03/2026 15:36'},
    {estado: 'In Process', dias: 1.5, inicio: '06/03/2026 15:36', fin: '10/03/2026 11:28'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '10/03/2026 11:28', fin: '10/03/2026 11:28'},
    {estado: 'In Process', dias: 0.1, inicio: '10/03/2026 11:28', fin: '10/03/2026 12:15'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '10/03/2026 12:15', fin: '10/03/2026 12:37'},
    {estado: 'IN TEST DEV', dias: 2, inicio: '10/03/2026 12:37', fin: '12/03/2026 12:25'},
    {estado: 'In Test', dias: 0.5, inicio: '12/03/2026 12:25', fin: '12/03/2026 17:23'},
    {estado: 'Test Issues', dias: 2.7, inicio: '12/03/2026 17:23', fin: '17/03/2026 14:09'},
    {estado: 'In Test', dias: 1.5, inicio: '17/03/2026 14:09', fin: '19/03/2026 09:35'},
    {estado: 'Test Issues', dias: 1.8, inicio: '19/03/2026 09:35', fin: '23/03/2026 07:09'},
    {estado: 'In Process', dias: 0.1, inicio: '23/03/2026 07:09', fin: '23/03/2026 08:37'},
    {estado: 'IN TEST DEV', dias: 0.9, inicio: '23/03/2026 08:37', fin: 'En curso'}
  ],
  'IMS-1120': [
    {estado: 'To do', dias: 0, inicio: '26/02/2026 13:05', fin: '26/02/2026 13:06'},
    {estado: 'In Process', dias: 0.6, inicio: '26/02/2026 13:06', fin: '27/02/2026 09:43'},
    {estado: 'CODE REVIEW', dias: 0.1, inicio: '27/02/2026 09:43', fin: '27/02/2026 10:29'},
    {estado: 'IN TEST DEV', dias: 1.9, inicio: '27/02/2026 10:29', fin: '03/03/2026 09:30'},
    {estado: 'In Test', dias: 0, inicio: '03/03/2026 09:30', fin: '03/03/2026 09:30'},
    {estado: 'IN TEST DEV', dias: 2.8, inicio: '03/03/2026 09:30', fin: '05/03/2026 17:09'},
    {estado: 'In Test', dias: 0.02, inicio: '05/03/2026 17:09', fin: '05/03/2026 17:22'},
    {estado: 'Finalizados', dias: 12, inicio: '05/03/2026 17:22', fin: 'En curso'}
  ],
  'IMS-1127': [
    {estado: 'To do', dias: 0, inicio: '27/02/2026 09:09', fin: '27/02/2026 09:09'},
    {estado: 'In Test', dias: 9.3, inicio: '27/02/2026 09:09', fin: '12/03/2026 11:49'},
    {estado: 'Finalizados', dias: 7.6, inicio: '12/03/2026 11:49', fin: 'En curso'}
  ],
  'IMS-1129': [
    {estado: 'To do', dias: 2.5, inicio: '27/02/2026 11:11', fin: '03/03/2026 15:35'},
    {estado: 'In Process', dias: 0.2, inicio: '03/03/2026 15:35', fin: '03/03/2026 17:51'},
    {estado: 'Blocked', dias: 0, inicio: '03/03/2026 17:51', fin: '03/03/2026 23:56'},
    {estado: 'CODE REVIEW', dias: 0.2, inicio: '03/03/2026 23:56', fin: '04/03/2026 09:23'},
    {estado: 'IN TEST DEV', dias: 0.1, inicio: '04/03/2026 09:23', fin: '04/03/2026 10:15'},
    {estado: 'In Process', dias: 0.1, inicio: '04/03/2026 10:15', fin: '04/03/2026 10:57'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '04/03/2026 10:57', fin: '04/03/2026 10:58'},
    {estado: 'IN TEST DEV', dias: 0.7, inicio: '04/03/2026 10:58', fin: '05/03/2026 08:31'},
    {estado: 'Test Issues', dias: 0.2, inicio: '05/03/2026 08:31', fin: '05/03/2026 09:57'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '05/03/2026 09:57', fin: '05/03/2026 10:09'},
    {estado: 'IN TEST DEV', dias: 0.5, inicio: '05/03/2026 10:09', fin: '05/03/2026 14:39'},
    {estado: 'In Test', dias: 0, inicio: '05/03/2026 14:39', fin: '05/03/2026 14:39'},
    {estado: 'Test Issues', dias: 0.7, inicio: '05/03/2026 14:39', fin: '06/03/2026 12:07'},
    {estado: 'In Process', dias: 0.1, inicio: '06/03/2026 12:07', fin: '06/03/2026 13:21'},
    {estado: 'In Test', dias: 0.7, inicio: '06/03/2026 13:21', fin: '09/03/2026 10:24'},
    {estado: 'Test Issues', dias: 1.2, inicio: '09/03/2026 10:24', fin: '10/03/2026 12:01'},
    {estado: 'In Test', dias: 0.6, inicio: '10/03/2026 12:01', fin: '10/03/2026 17:44'},
    {estado: 'Finalizados', dias: 9, inicio: '10/03/2026 17:44', fin: 'En curso'}
  ],
  'IMS-1130': [
    {estado: 'To do', dias: 0.5, inicio: '02/03/2026 12:45', fin: '03/03/2026 07:50'},
    {estado: 'In Process', dias: 0, inicio: '03/03/2026 07:50', fin: '03/03/2026 08:22'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '03/03/2026 08:22', fin: '03/03/2026 08:37'},
    {estado: 'In Process', dias: 0.1, inicio: '03/03/2026 08:37', fin: '03/03/2026 09:45'},
    {estado: 'CODE REVIEW', dias: 0.1, inicio: '03/03/2026 09:45', fin: '03/03/2026 10:58'},
    {estado: 'IN TEST DEV', dias: 0.2, inicio: '03/03/2026 10:58', fin: '03/03/2026 12:28'},
    {estado: 'In Test', dias: 0.4, inicio: '03/03/2026 12:28', fin: '03/03/2026 16:19'},
    {estado: 'Test Issues', dias: 0.3, inicio: '03/03/2026 16:19', fin: '04/03/2026 09:58'},
    {estado: 'In Test', dias: 0.7, inicio: '04/03/2026 09:58', fin: '04/03/2026 16:30'},
    {estado: 'Finalizados', dias: 13.1, inicio: '04/03/2026 16:30', fin: 'En curso'}
  ],
  'IMS-1131': [
    {estado: 'To do', dias: 0.8, inicio: '02/03/2026 13:11', fin: '03/03/2026 11:00'},
    {estado: 'In Process', dias: 0.2, inicio: '03/03/2026 11:00', fin: '03/03/2026 12:23'},
    {estado: 'CODE REVIEW', dias: 0.5, inicio: '03/03/2026 12:23', fin: '03/03/2026 16:36'},
    {estado: 'IN TEST DEV', dias: 0.9, inicio: '03/03/2026 16:36', fin: '04/03/2026 15:53'},
    {estado: 'In Test', dias: 0, inicio: '04/03/2026 15:53', fin: '04/03/2026 15:53'},
    {estado: 'Finalizados', dias: 13.1, inicio: '04/03/2026 15:53', fin: 'En curso'}
  ],
  'IMS-1132': [
    {estado: 'To do', dias: 0, inicio: '02/03/2026 15:20', fin: '02/03/2026 15:20'},
    {estado: 'In Process', dias: 0.2, inicio: '02/03/2026 15:20', fin: '02/03/2026 17:04'},
    {estado: 'Finalizados', dias: 15, inicio: '02/03/2026 17:04', fin: 'En curso'}
  ],
  'IMS-1133': [
    {estado: 'To do', dias: 0, inicio: '02/03/2026 15:20', fin: '02/03/2026 15:20'},
    {estado: 'In Process', dias: 0, inicio: '02/03/2026 15:20', fin: '02/03/2026 15:26'},
    {estado: 'To do', dias: 0.8, inicio: '02/03/2026 15:26', fin: '03/03/2026 13:31'},
    {estado: 'In Process', dias: 0.7, inicio: '03/03/2026 13:31', fin: '04/03/2026 11:15'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '04/03/2026 11:15', fin: '04/03/2026 11:20'},
    {estado: 'IN TEST DEV', dias: 1.6, inicio: '04/03/2026 11:20', fin: '05/03/2026 17:29'},
    {estado: 'In Test', dias: 0.4, inicio: '05/03/2026 17:29', fin: '06/03/2026 11:42'},
    {estado: 'Finalizados', dias: 11.6, inicio: '06/03/2026 11:42', fin: 'En curso'}
  ],
  'IMS-1135': [
    {estado: 'To do', dias: 1.4, inicio: '02/03/2026 17:06', fin: '04/03/2026 11:50'},
    {estado: 'In Process', dias: 1.6, inicio: '04/03/2026 11:50', fin: '05/03/2026 16:52'},
    {estado: 'Blocked', dias: 0, inicio: '05/03/2026 16:52', fin: '05/03/2026 21:42'},
    {estado: 'In Process', dias: 0.01, inicio: '05/03/2026 21:42', fin: '05/03/2026 21:50'},
    {estado: 'CODE REVIEW', dias: 0.5, inicio: '05/03/2026 21:50', fin: '06/03/2026 12:26'},
    {estado: 'IN TEST DEV', dias: 1, inicio: '06/03/2026 12:26', fin: '09/03/2026 12:12'},
    {estado: 'In Test', dias: 0.5, inicio: '09/03/2026 12:12', fin: '09/03/2026 16:37'},
    {estado: 'Test Issues', dias: 0.2, inicio: '09/03/2026 16:37', fin: '10/03/2026 09:25'},
    {estado: 'In Test', dias: 0, inicio: '10/03/2026 09:25', fin: '10/03/2026 09:26'},
    {estado: 'Finalizados', dias: 9.8, inicio: '10/03/2026 09:26', fin: 'En curso'}
  ],
  'IMS-1136': [
    {estado: 'To do', dias: 1.3, inicio: '02/03/2026 17:17', fin: '04/03/2026 10:56'},
    {estado: 'In Process', dias: 1.7, inicio: '04/03/2026 10:56', fin: '05/03/2026 18:16'},
    {estado: 'IN TEST DEV', dias: 1.6, inicio: '05/03/2026 18:16', fin: '09/03/2026 13:28'},
    {estado: 'In Test', dias: 0, inicio: '09/03/2026 13:28', fin: '09/03/2026 13:28'},
    {estado: 'Finalizados', dias: 10.4, inicio: '09/03/2026 13:28', fin: 'En curso'}
  ],
  'IMS-1137': [
    {estado: 'To do', dias: 6.1, inicio: '02/03/2026 17:18', fin: '11/03/2026 09:17'},
    {estado: 'In Process', dias: 0.9, inicio: '11/03/2026 09:17', fin: '12/03/2026 07:40'},
    {estado: 'Blocked', dias: 0.4, inicio: '12/03/2026 07:40', fin: '12/03/2026 11:57'},
    {estado: 'In Process', dias: 0.6, inicio: '12/03/2026 11:57', fin: '13/03/2026 07:11'},
    {estado: 'IN TEST DEV', dias: 3.2, inicio: '13/03/2026 07:11', fin: '18/03/2026 10:01'},
    {estado: 'In Test', dias: 1, inicio: '18/03/2026 10:01', fin: '19/03/2026 09:57'},
    {estado: 'Finalizados', dias: 2.8, inicio: '19/03/2026 09:57', fin: 'En curso'}
  ],
  'IMS-1138': [
    {estado: 'To do', dias: 0.5, inicio: '02/03/2026 17:29', fin: '03/03/2026 12:23'},
    {estado: 'In Process', dias: 0.7, inicio: '03/03/2026 12:23', fin: '04/03/2026 10:07'},
    {estado: 'CODE REVIEW', dias: 3.8, inicio: '04/03/2026 10:07', fin: '09/03/2026 17:27'},
    {estado: 'IN TEST DEV', dias: 0.2, inicio: '09/03/2026 17:27', fin: '10/03/2026 10:09'},
    {estado: 'In Test', dias: 0.3, inicio: '10/03/2026 10:09', fin: '10/03/2026 13:07'},
    {estado: 'Finalizados', dias: 9.4, inicio: '10/03/2026 13:07', fin: 'En curso'}
  ],
  'IMS-1139': [
    {estado: 'To do', dias: 1.2, inicio: '02/03/2026 17:39', fin: '04/03/2026 09:36'},
    {estado: 'In Process', dias: 0.8, inicio: '04/03/2026 09:36', fin: '04/03/2026 16:43'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '04/03/2026 16:43', fin: '04/03/2026 17:24'},
    {estado: 'In Process', dias: 0.1, inicio: '04/03/2026 17:24', fin: '05/03/2026 08:48'},
    {estado: 'CODE REVIEW', dias: 0.2, inicio: '05/03/2026 08:48', fin: '05/03/2026 10:34'},
    {estado: 'IN TEST DEV', dias: 0.5, inicio: '05/03/2026 10:34', fin: '05/03/2026 14:39'},
    {estado: 'In Test', dias: 0.2, inicio: '05/03/2026 14:39', fin: '05/03/2026 16:51'},
    {estado: 'Finalizados', dias: 12, inicio: '05/03/2026 16:51', fin: 'En curso'}
  ],
  'IMS-1140': [
    {estado: 'To do', dias: 0.01, inicio: '02/03/2026 19:02', fin: '02/03/2026 19:07'},
    {estado: 'In Process', dias: 0.02, inicio: '02/03/2026 19:07', fin: '02/03/2026 19:17'},
    {estado: 'CODE REVIEW', dias: 0.6, inicio: '02/03/2026 19:17', fin: '03/03/2026 13:28'},
    {estado: 'IN TEST DEV', dias: 0.4, inicio: '03/03/2026 13:28', fin: '04/03/2026 08:05'},
    {estado: 'In Test', dias: 0, inicio: '04/03/2026 08:05', fin: '04/03/2026 08:31'},
    {estado: 'Finalizados', dias: 13.9, inicio: '04/03/2026 08:31', fin: 'En curso'}
  ],
  'IMS-1141': [
    {estado: 'To do', dias: 1.4, inicio: '02/03/2026 19:18', fin: '04/03/2026 11:21'},
    {estado: 'In Process', dias: 0, inicio: '04/03/2026 11:21', fin: '04/03/2026 11:24'},
    {estado: 'To do', dias: 1.4, inicio: '04/03/2026 11:24', fin: '05/03/2026 14:49'},
    {estado: 'In Process', dias: 0.2, inicio: '05/03/2026 14:49', fin: '05/03/2026 21:50'},
    {estado: 'CODE REVIEW', dias: 2, inicio: '05/03/2026 21:50', fin: '09/03/2026 18:16'},
    {estado: 'IN TEST DEV', dias: 0.2, inicio: '09/03/2026 18:16', fin: '10/03/2026 09:56'},
    {estado: 'In Test', dias: 0.8, inicio: '10/03/2026 09:56', fin: '10/03/2026 17:17'},
    {estado: 'Test Issues', dias: 1.8, inicio: '10/03/2026 17:17', fin: '12/03/2026 15:21'},
    {estado: 'IN TEST DEV', dias: 0.2, inicio: '12/03/2026 15:21', fin: '12/03/2026 17:38'},
    {estado: 'In Test', dias: 0.09, inicio: '12/03/2026 17:38', fin: '12/03/2026 18:26'},
    {estado: 'Finalizados', dias: 7, inicio: '12/03/2026 18:26', fin: 'En curso'}
  ],
  'IMS-1142': [
    {estado: 'To do', dias: 0, inicio: '02/03/2026 20:05', fin: '02/03/2026 20:05'},
    {estado: 'In Process', dias: 0, inicio: '02/03/2026 20:05', fin: '02/03/2026 20:06'},
    {estado: 'IN TEST DEV', dias: 0, inicio: '02/03/2026 20:06', fin: '02/03/2026 20:06'},
    {estado: 'In Test', dias: 0, inicio: '02/03/2026 20:06', fin: '02/03/2026 20:06'},
    {estado: 'Finalizados', dias: 15, inicio: '02/03/2026 20:06', fin: 'En curso'}
  ],
  'IMS-1143': [
    {estado: 'To do', dias: 5.4, inicio: '03/03/2026 08:14', fin: '10/03/2026 12:15'},
    {estado: 'In Process', dias: 0, inicio: '10/03/2026 12:15', fin: '10/03/2026 12:37'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '10/03/2026 12:37', fin: '10/03/2026 12:37'},
    {estado: 'IN TEST DEV', dias: 2.1, inicio: '10/03/2026 12:37', fin: '12/03/2026 13:20'},
    {estado: 'In Test', dias: 0, inicio: '12/03/2026 13:20', fin: '12/03/2026 13:46'},
    {estado: 'Finalizados', dias: 7.4, inicio: '12/03/2026 13:46', fin: 'En curso'}
  ],
  'IMS-1144': [
    {estado: 'To do', dias: 0.1, inicio: '03/03/2026 09:53', fin: '03/03/2026 10:58'},
    {estado: 'In Process', dias: 0.7, inicio: '03/03/2026 10:58', fin: '04/03/2026 07:29'},
    {estado: 'CODE REVIEW', dias: 0.2, inicio: '04/03/2026 07:29', fin: '04/03/2026 10:04'},
    {estado: 'IN TEST DEV', dias: 0, inicio: '04/03/2026 10:04', fin: '04/03/2026 10:12'},
    {estado: 'IN TEST DEV', dias: 2.2, inicio: '04/03/2026 10:12', fin: '06/03/2026 11:42'},
    {estado: 'In Test', dias: 0.1, inicio: '06/03/2026 11:42', fin: '06/03/2026 12:20'},
    {estado: 'IN TEST DEV', dias: 0.9, inicio: '06/03/2026 12:20', fin: '09/03/2026 11:04'},
    {estado: 'In Test', dias: 0.1, inicio: '09/03/2026 11:04', fin: '09/03/2026 12:11'},
    {estado: 'Finalizados', dias: 10.5, inicio: '09/03/2026 12:11', fin: 'En curso'}
  ],
  'IMS-1145': [
    {estado: 'To do', dias: 0, inicio: '03/03/2026 10:39', fin: '03/03/2026 10:39'},
    {estado: 'In Process', dias: 0.3, inicio: '03/03/2026 10:39', fin: '03/03/2026 13:31'},
    {estado: 'Blocked', dias: 0.2, inicio: '03/03/2026 13:31', fin: '03/03/2026 15:41'},
    {estado: 'IN TEST DEV', dias: 2.1, inicio: '03/03/2026 15:41', fin: '05/03/2026 17:29'},
    {estado: 'In Test', dias: 0.4, inicio: '05/03/2026 17:29', fin: '06/03/2026 11:41'},
    {estado: 'Finalizados', dias: 11.6, inicio: '06/03/2026 11:41', fin: 'En curso'}
  ],
  'IMS-1146': [
    {estado: 'To do', dias: 6.7, inicio: '03/03/2026 10:50', fin: '12/03/2026 07:46'},
    {estado: 'In Process', dias: 0.4, inicio: '12/03/2026 07:46', fin: '12/03/2026 11:57'},
    {estado: 'To do', dias: 0.6, inicio: '12/03/2026 11:57', fin: '13/03/2026 07:44'},
    {estado: 'In Process', dias: 2.4, inicio: '13/03/2026 07:44', fin: '17/03/2026 11:40'},
    {estado: 'IN TEST DEV', dias: 4.6, inicio: '17/03/2026 11:40', fin: 'En curso'}
  ],
  'IMS-1147': [
    {estado: 'To do', dias: 1, inicio: '03/03/2026 11:27', fin: '04/03/2026 11:38'},
    {estado: 'In Process', dias: 0, inicio: '04/03/2026 11:38', fin: '04/03/2026 11:44'},
    {estado: 'To do', dias: 2.8, inicio: '04/03/2026 11:44', fin: '09/03/2026 09:29'},
    {estado: 'In Process', dias: 0, inicio: '09/03/2026 09:29', fin: '09/03/2026 09:48'},
    {estado: 'Blocked', dias: 0.1, inicio: '09/03/2026 09:48', fin: '09/03/2026 10:40'},
    {estado: 'In Process', dias: 0, inicio: '09/03/2026 10:40', fin: '09/03/2026 10:58'},
    {estado: 'Blocked', dias: 0, inicio: '09/03/2026 10:58', fin: '09/03/2026 11:00'},
    {estado: 'In Process', dias: 0.7, inicio: '09/03/2026 11:00', fin: '09/03/2026 18:19'},
    {estado: 'Blocked', dias: 0.2, inicio: '09/03/2026 18:19', fin: '10/03/2026 09:43'},
    {estado: 'In Process', dias: 0.2, inicio: '10/03/2026 09:43', fin: '10/03/2026 11:09'},
    {estado: 'Blocked', dias: 0, inicio: '10/03/2026 11:09', fin: '10/03/2026 11:18'},
    {estado: 'In Process', dias: 0.3, inicio: '10/03/2026 11:18', fin: '10/03/2026 13:36'},
    {estado: 'CODE REVIEW', dias: 0.2, inicio: '10/03/2026 13:36', fin: '10/03/2026 15:18'},
    {estado: 'IN TEST DEV', dias: 1.6, inicio: '10/03/2026 15:18', fin: '12/03/2026 11:58'},
    {estado: 'In Test', dias: 0, inicio: '12/03/2026 11:58', fin: '12/03/2026 12:02'},
    {estado: 'Finalizados', dias: 7.6, inicio: '12/03/2026 12:02', fin: 'En curso'}
  ],
  'IMS-1148': [
    {estado: 'To do', dias: 8.7, inicio: '03/03/2026 11:28', fin: '16/03/2026 08:42'},
    {estado: 'In Process', dias: 1.3, inicio: '16/03/2026 08:42', fin: '17/03/2026 11:21'},
    {estado: 'CODE REVIEW', dias: 0.1, inicio: '17/03/2026 11:21', fin: '17/03/2026 12:21'},
    {estado: 'IN TEST DEV', dias: 1.7, inicio: '17/03/2026 12:21', fin: '19/03/2026 09:57'},
    {estado: 'In Test', dias: 0.4, inicio: '19/03/2026 09:57', fin: '19/03/2026 13:51'},
    {estado: 'Test Issues', dias: 2.3, inicio: '19/03/2026 13:51', fin: 'En curso'}
  ],
  'IMS-1149': [
    {estado: 'To do', dias: 0, inicio: '03/03/2026 12:27', fin: '03/03/2026 12:27'},
    {estado: 'In Process', dias: 0.5, inicio: '03/03/2026 12:27', fin: '03/03/2026 23:46'},
    {estado: 'IN TEST DEV', dias: 1.6, inicio: '03/03/2026 23:46', fin: '05/03/2026 13:15'},
    {estado: 'Finalizados', dias: 12.4, inicio: '05/03/2026 13:15', fin: 'En curso'}
  ],
  'IMS-1150': [
    {estado: 'To do', dias: 0, inicio: '03/03/2026 17:50', fin: '03/03/2026 17:50'},
    {estado: 'In Process', dias: 0.16, inicio: '03/03/2026 17:50', fin: '03/03/2026 19:14'},
    {estado: 'IN TEST DEV', dias: 2, inicio: '03/03/2026 19:14', fin: '05/03/2026 17:26'},
    {estado: 'In Test', dias: 0, inicio: '05/03/2026 17:26', fin: '05/03/2026 17:26'},
    {estado: 'Finalizados', dias: 12, inicio: '05/03/2026 17:26', fin: 'En curso'}
  ],
  'IMS-1151': [
    {estado: 'To do', dias: 0, inicio: '03/03/2026 19:14', fin: '03/03/2026 19:14'},
    {estado: 'In Process', dias: 0.2, inicio: '03/03/2026 19:14', fin: '04/03/2026 09:23'},
    {estado: 'IN TEST DEV', dias: 2.3, inicio: '04/03/2026 09:23', fin: '06/03/2026 11:51'},
    {estado: 'In Test', dias: 0.1, inicio: '06/03/2026 11:51', fin: '06/03/2026 12:18'},
    {estado: 'Finalizados', dias: 11.5, inicio: '06/03/2026 12:18', fin: 'En curso'}
  ],
  'IMS-1152': [
    {estado: 'To do', dias: 1.6, inicio: '04/03/2026 13:29', fin: '06/03/2026 09:54'},
    {estado: 'In Process', dias: 0.3, inicio: '06/03/2026 09:54', fin: '06/03/2026 12:53'},
    {estado: 'Finalizados', dias: 11.5, inicio: '06/03/2026 12:53', fin: 'En curso'}
  ],
  'IMS-1154': [
    {estado: 'To do', dias: 0.1, inicio: '04/03/2026 21:20', fin: '05/03/2026 08:48'},
    {estado: 'In Process', dias: 0.1, inicio: '05/03/2026 08:48', fin: '05/03/2026 09:43'},
    {estado: 'CODE REVIEW', dias: 0.1, inicio: '05/03/2026 09:43', fin: '05/03/2026 10:34'},
    {estado: 'IN TEST DEV', dias: 0.5, inicio: '05/03/2026 10:34', fin: '05/03/2026 14:39'},
    {estado: 'In Test', dias: 0.2, inicio: '05/03/2026 14:39', fin: '05/03/2026 16:50'},
    {estado: 'Finalizados', dias: 12, inicio: '05/03/2026 16:50', fin: 'En curso'}
  ],
  'IMS-1155': [
    {estado: 'To do', dias: 0, inicio: '05/03/2026 09:21', fin: '05/03/2026 09:21'},
    {estado: 'In Process', dias: 0, inicio: '05/03/2026 09:21', fin: '05/03/2026 09:21'},
    {estado: 'IN TEST DEV', dias: 0, inicio: '05/03/2026 09:21', fin: '05/03/2026 09:22'},
    {estado: 'In Test', dias: 0, inicio: '05/03/2026 09:22', fin: '05/03/2026 09:22'},
    {estado: 'Finalizados', dias: 12.8, inicio: '05/03/2026 09:22', fin: 'En curso'}
  ],
  'IMS-1156': [
    {estado: 'To do', dias: 0, inicio: '05/03/2026 10:37', fin: '05/03/2026 10:37'},
    {estado: 'In Process', dias: 0.3, inicio: '05/03/2026 10:37', fin: '05/03/2026 13:34'},
    {estado: 'IN TEST DEV', dias: 0.9, inicio: '05/03/2026 13:34', fin: '06/03/2026 12:19'},
    {estado: 'In Test', dias: 0.9, inicio: '06/03/2026 12:19', fin: '09/03/2026 11:04'},
    {estado: 'Finalizados', dias: 10.7, inicio: '09/03/2026 11:04', fin: 'En curso'}
  ],
  'IMS-1157': [
    {estado: 'To do', dias: 1.3, inicio: '05/03/2026 12:02', fin: '06/03/2026 14:18'},
    {estado: 'In Process', dias: 0.5, inicio: '06/03/2026 14:18', fin: '09/03/2026 09:27'},
    {estado: 'Blocked', dias: 0.8, inicio: '09/03/2026 09:27', fin: '09/03/2026 17:39'},
    {estado: 'CODE REVIEW', dias: 0.07, inicio: '09/03/2026 17:39', fin: '09/03/2026 18:16'},
    {estado: 'IN TEST DEV', dias: 0.1, inicio: '09/03/2026 18:16', fin: '10/03/2026 08:56'},
    {estado: 'In Test', dias: 0.1, inicio: '10/03/2026 08:56', fin: '10/03/2026 09:47'},
    {estado: 'Finalizados', dias: 9.8, inicio: '10/03/2026 09:47', fin: 'En curso'}
  ],
  'IMS-1158': [
    {estado: 'To do', dias: 0, inicio: '05/03/2026 12:30', fin: '05/03/2026 12:36'},
    {estado: 'In Process', dias: 0.3, inicio: '05/03/2026 12:36', fin: '05/03/2026 14:54'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '05/03/2026 14:54', fin: '05/03/2026 15:11'},
    {estado: 'IN TEST DEV', dias: 1.8, inicio: '05/03/2026 15:11', fin: '09/03/2026 13:43'},
    {estado: 'In Test', dias: 0.3, inicio: '09/03/2026 13:43', fin: '09/03/2026 16:10'},
    {estado: 'Finalizados', dias: 10.1, inicio: '09/03/2026 16:10', fin: 'En curso'}
  ],
  'IMS-1160': [
    {estado: 'To do', dias: 0.6, inicio: '05/03/2026 13:59', fin: '06/03/2026 09:59'},
    {estado: 'In Process', dias: 0.1, inicio: '06/03/2026 09:59', fin: '06/03/2026 10:32'},
    {estado: 'To do', dias: 0.4, inicio: '06/03/2026 10:32', fin: '06/03/2026 14:15'},
    {estado: 'In Process', dias: 0, inicio: '06/03/2026 14:15', fin: '06/03/2026 14:15'},
    {estado: 'To do', dias: 0, inicio: '06/03/2026 14:15', fin: '06/03/2026 14:15'},
    {estado: 'In Process', dias: 0, inicio: '06/03/2026 14:15', fin: '06/03/2026 14:15'},
    {estado: 'To do', dias: 0.5, inicio: '06/03/2026 14:15', fin: '09/03/2026 09:44'},
    {estado: 'CODE REVIEW', dias: 0.8, inicio: '09/03/2026 09:44', fin: '09/03/2026 18:16'},
    {estado: 'IN TEST DEV', dias: 0.2, inicio: '09/03/2026 18:16', fin: '10/03/2026 09:56'},
    {estado: 'In Test', dias: 0.2, inicio: '10/03/2026 09:56', fin: '10/03/2026 12:00'},
    {estado: 'Finalizados', dias: 9.6, inicio: '10/03/2026 12:00', fin: 'En curso'}
  ],
  'IMS-1161': [
    {estado: 'To do', dias: 0.3, inicio: '05/03/2026 14:12', fin: '05/03/2026 21:53'},
    {estado: 'CODE REVIEW', dias: 2, inicio: '05/03/2026 21:53', fin: '09/03/2026 18:18'},
    {estado: 'IN TEST DEV', dias: 0.1, inicio: '09/03/2026 18:18', fin: '10/03/2026 08:54'},
    {estado: 'In Test', dias: 0, inicio: '10/03/2026 08:54', fin: '10/03/2026 08:56'},
    {estado: 'Test Issues', dias: 0.1, inicio: '10/03/2026 08:56', fin: '10/03/2026 09:26'},
    {estado: 'In Test', dias: 0.1, inicio: '10/03/2026 09:26', fin: '10/03/2026 09:55'},
    {estado: 'Finalizados', dias: 9.8, inicio: '10/03/2026 09:55', fin: 'En curso'}
  ],
  'IMS-1162': [
    {estado: 'To do', dias: 0, inicio: '06/03/2026 08:38', fin: '06/03/2026 08:38'},
    {estado: 'In Process', dias: 0.3, inicio: '06/03/2026 08:38', fin: '06/03/2026 11:05'},
    {estado: 'CODE REVIEW', dias: 0.5, inicio: '06/03/2026 11:05', fin: '06/03/2026 15:30'},
    {estado: 'IN TEST DEV', dias: 0.8, inicio: '06/03/2026 15:30', fin: '09/03/2026 13:30'},
    {estado: 'In Test', dias: 0, inicio: '09/03/2026 13:30', fin: '09/03/2026 13:39'},
    {estado: 'Finalizados', dias: 10.4, inicio: '09/03/2026 13:39', fin: 'En curso'}
  ],
  'IMS-1163': [
    {estado: 'To do', dias: 0, inicio: '06/03/2026 11:17', fin: '06/03/2026 11:17'},
    {estado: 'In Process', dias: 0, inicio: '06/03/2026 11:17', fin: '06/03/2026 11:25'},
    {estado: 'To do', dias: 0.9, inicio: '06/03/2026 11:25', fin: '09/03/2026 10:11'},
    {estado: 'In Process', dias: 0.6, inicio: '09/03/2026 10:11', fin: '09/03/2026 15:25'},
    {estado: 'Blocked', dias: 0.2, inicio: '09/03/2026 15:25', fin: '10/03/2026 08:26'},
    {estado: 'In Process', dias: 1.1, inicio: '10/03/2026 08:26', fin: '11/03/2026 09:34'},
    {estado: 'Blocked', dias: 0.4, inicio: '11/03/2026 09:34', fin: '11/03/2026 13:05'},
    {estado: 'In Process', dias: 0.1, inicio: '11/03/2026 13:05', fin: '11/03/2026 13:47'},
    {estado: 'Blocked', dias: 2.9, inicio: '11/03/2026 13:47', fin: '16/03/2026 12:38'},
    {estado: 'In Process', dias: 0.3, inicio: '16/03/2026 12:38', fin: '16/03/2026 14:57'},
    {estado: 'Blocked', dias: 0.6, inicio: '16/03/2026 14:57', fin: '17/03/2026 11:18'},
    {estado: 'CODE REVIEW', dias: 0.9, inicio: '17/03/2026 11:18', fin: '18/03/2026 10:00'},
    {estado: 'IN TEST DEV', dias: 1.9, inicio: '18/03/2026 10:00', fin: '20/03/2026 08:50'},
    {estado: 'Finalizados', dias: 1.9, inicio: '20/03/2026 08:50', fin: 'En curso'}
  ],
  'IMS-1164': [
    {estado: 'To do', dias: 0, inicio: '06/03/2026 11:18', fin: '06/03/2026 11:18'},
    {estado: 'In Process', dias: 0, inicio: '06/03/2026 11:18', fin: '06/03/2026 11:25'},
    {estado: 'To do', dias: 2.8, inicio: '06/03/2026 11:25', fin: '11/03/2026 09:51'},
    {estado: 'In Process', dias: 0.2, inicio: '11/03/2026 09:51', fin: '11/03/2026 11:19'},
    {estado: 'To do', dias: 0.3, inicio: '11/03/2026 11:19', fin: '11/03/2026 13:47'},
    {estado: 'In Process', dias: 0.4, inicio: '11/03/2026 13:47', fin: '12/03/2026 08:11'},
    {estado: 'Blocked', dias: 0.1, inicio: '12/03/2026 08:11', fin: '12/03/2026 08:56'},
    {estado: 'In Process', dias: 1.2, inicio: '12/03/2026 08:56', fin: '13/03/2026 10:34'},
    {estado: 'Blocked', dias: 0.3, inicio: '13/03/2026 10:34', fin: '13/03/2026 13:30'},
    {estado: 'In Process', dias: 0, inicio: '13/03/2026 13:30', fin: '13/03/2026 13:37'},
    {estado: 'Blocked', dias: 6.4, inicio: '13/03/2026 13:37', fin: 'En curso'}
  ],
  'IMS-1165': [
    {estado: 'To do', dias: 0, inicio: '06/03/2026 12:10', fin: '06/03/2026 12:29'},
    {estado: 'In Process', dias: 0.2, inicio: '06/03/2026 12:29', fin: '06/03/2026 14:12'},
    {estado: 'CODE REVIEW', dias: 1.6, inicio: '06/03/2026 14:12', fin: '10/03/2026 10:12'},
    {estado: 'Finalizados', dias: 9.8, inicio: '10/03/2026 10:12', fin: 'En curso'}
  ],
  'IMS-1166': [
    {estado: 'To do', dias: 0, inicio: '06/03/2026 13:01', fin: '06/03/2026 13:01'},
    {estado: 'In Process', dias: 0.2, inicio: '06/03/2026 13:01', fin: '06/03/2026 15:10'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '06/03/2026 15:10', fin: '06/03/2026 15:10'},
    {estado: 'Finalizados', dias: 11.2, inicio: '06/03/2026 15:10', fin: 'En curso'}
  ],
  'IMS-1168': [
    {estado: 'To do', dias: 0.6, inicio: '09/03/2026 11:39', fin: '09/03/2026 18:22'},
    {estado: 'In Process', dias: 0.2, inicio: '09/03/2026 18:22', fin: '10/03/2026 09:43'},
    {estado: 'Blocked', dias: 0.2, inicio: '10/03/2026 09:43', fin: '10/03/2026 11:09'},
    {estado: 'In Process', dias: 0.2, inicio: '10/03/2026 11:09', fin: '10/03/2026 13:12'},
    {estado: 'Blocked', dias: 0.2, inicio: '10/03/2026 13:12', fin: '10/03/2026 15:16'},
    {estado: 'In Process', dias: 0.2, inicio: '10/03/2026 15:16', fin: '10/03/2026 17:00'},
    {estado: 'IN TEST DEV', dias: 0.08, inicio: '10/03/2026 17:00', fin: '10/03/2026 17:44'},
    {estado: 'In Test', dias: 0.2, inicio: '10/03/2026 17:44', fin: '11/03/2026 10:00'},
    {estado: 'Finalizados', dias: 8.8, inicio: '11/03/2026 10:00', fin: 'En curso'}
  ],
  'IMS-1169': [
    {estado: 'To do', dias: 1.1, inicio: '09/03/2026 12:23', fin: '10/03/2026 13:13'},
    {estado: 'In Process', dias: 0.1, inicio: '10/03/2026 13:13', fin: '10/03/2026 14:12'},
    {estado: 'CODE REVIEW', dias: 0.5, inicio: '10/03/2026 14:12', fin: '11/03/2026 09:17'},
    {estado: 'IN TEST DEV', dias: 0.1, inicio: '11/03/2026 09:17', fin: '11/03/2026 10:00'},
    {estado: 'In Test', dias: 1.2, inicio: '11/03/2026 10:00', fin: '12/03/2026 11:48'},
    {estado: 'Finalizados', dias: 7.6, inicio: '12/03/2026 11:48', fin: 'En curso'}
  ],
  'IMS-1170': [
    {estado: 'To do', dias: 0.1, inicio: '09/03/2026 13:32', fin: '09/03/2026 14:17'},
    {estado: 'In Process', dias: 0.2, inicio: '09/03/2026 14:17', fin: '09/03/2026 16:05'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '09/03/2026 16:05', fin: '09/03/2026 16:05'},
    {estado: 'In Test', dias: 0.3, inicio: '09/03/2026 16:05', fin: '10/03/2026 10:12'},
    {estado: 'Finalizados', dias: 9.8, inicio: '10/03/2026 10:12', fin: 'En curso'}
  ],
  'IMS-1171': [
    {estado: 'To do', dias: 0, inicio: '09/03/2026 16:25', fin: '09/03/2026 16:40'},
    {estado: 'In Process', dias: 0, inicio: '09/03/2026 16:40', fin: '09/03/2026 22:37'},
    {estado: 'CODE REVIEW', dias: 1.3, inicio: '09/03/2026 22:37', fin: '11/03/2026 10:35'},
    {estado: 'Finalizados', dias: 8.7, inicio: '11/03/2026 10:35', fin: 'En curso'}
  ],
  'IMS-1172': [
    {estado: 'To do', dias: 0, inicio: '09/03/2026 16:55', fin: '09/03/2026 16:55'},
    {estado: 'In Process', dias: 0, inicio: '09/03/2026 16:55', fin: '09/03/2026 21:44'},
    {estado: 'IN TEST DEV', dias: 0.2, inicio: '09/03/2026 21:44', fin: '10/03/2026 09:57'},
    {estado: 'In Test', dias: 0, inicio: '10/03/2026 09:57', fin: '10/03/2026 09:57'},
    {estado: 'Finalizados', dias: 9.8, inicio: '10/03/2026 09:57', fin: 'En curso'}
  ],
  'IMS-1173': [
    {estado: 'To do', dias: 0, inicio: '09/03/2026 17:38', fin: '09/03/2026 17:38'},
    {estado: 'In Process', dias: 0.07, inicio: '09/03/2026 17:38', fin: '09/03/2026 18:18'},
    {estado: 'IN TEST DEV', dias: 1.2, inicio: '09/03/2026 18:18', fin: '11/03/2026 10:00'},
    {estado: 'In Test', dias: 1.7, inicio: '11/03/2026 10:00', fin: '12/03/2026 16:07'},
    {estado: 'Finalizados', dias: 7.1, inicio: '12/03/2026 16:07', fin: 'En curso'}
  ],
  'IMS-1174': [
    {estado: 'To do', dias: 0.6, inicio: '10/03/2026 11:24', fin: '10/03/2026 18:09'},
    {estado: 'In Process', dias: 0.16, inicio: '10/03/2026 18:09', fin: '10/03/2026 19:33'},
    {estado: 'IN TEST DEV', dias: 0.2, inicio: '10/03/2026 19:33', fin: '11/03/2026 09:52'},
    {estado: 'In Test', dias: 0, inicio: '11/03/2026 09:52', fin: '11/03/2026 09:52'},
    {estado: 'Test Issues', dias: 1.1, inicio: '11/03/2026 09:52', fin: '12/03/2026 10:43'},
    {estado: 'In Process', dias: 0.4, inicio: '12/03/2026 10:43', fin: '12/03/2026 14:37'},
    {estado: 'Test Issues', dias: 0.1, inicio: '12/03/2026 14:37', fin: '12/03/2026 15:20'},
    {estado: 'IN TEST DEV', dias: 0.2, inicio: '12/03/2026 15:20', fin: '12/03/2026 17:38'},
    {estado: 'In Test', dias: 0.11, inicio: '12/03/2026 17:38', fin: '12/03/2026 18:36'},
    {estado: 'Test Issues', dias: 7, inicio: '12/03/2026 18:36', fin: 'En curso'}
  ],
  'IMS-1175': [
    {estado: 'To do', dias: 0.3, inicio: '10/03/2026 11:54', fin: '10/03/2026 14:13'},
    {estado: 'In Process', dias: 0.4, inicio: '10/03/2026 14:13', fin: '11/03/2026 09:16'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '11/03/2026 09:16', fin: '11/03/2026 09:22'},
    {estado: 'IN TEST DEV', dias: 0.1, inicio: '11/03/2026 09:22', fin: '11/03/2026 10:00'},
    {estado: 'In Test', dias: 1, inicio: '11/03/2026 10:00', fin: '12/03/2026 09:41'},
    {estado: 'Finalizados', dias: 7.8, inicio: '12/03/2026 09:41', fin: 'En curso'}
  ],
  'IMS-1176': [
    {estado: 'To do', dias: 0, inicio: '10/03/2026 21:42', fin: '10/03/2026 21:42'},
    {estado: 'In Process', dias: 0, inicio: '10/03/2026 21:42', fin: '10/03/2026 21:43'},
    {estado: 'IN TEST DEV', dias: 0, inicio: '10/03/2026 21:43', fin: '10/03/2026 21:43'},
    {estado: 'Finalizados', dias: 9, inicio: '10/03/2026 21:43', fin: 'En curso'}
  ],
  'IMS-1177': [
    {estado: 'To do', dias: 0.1, inicio: '11/03/2026 09:44', fin: '11/03/2026 10:19'},
    {estado: 'In Process', dias: 0, inicio: '11/03/2026 10:19', fin: '11/03/2026 10:35'},
    {estado: 'To do', dias: 1.7, inicio: '11/03/2026 10:35', fin: '12/03/2026 17:11'},
    {estado: 'In Process', dias: 0.3, inicio: '12/03/2026 17:11', fin: '13/03/2026 10:56'},
    {estado: 'Blocked', dias: 1.9, inicio: '13/03/2026 10:56', fin: '17/03/2026 10:18'},
    {estado: 'Finalizados', dias: 4.7, inicio: '17/03/2026 10:18', fin: 'En curso'}
  ],
  'IMS-1179': [
    {estado: 'To do', dias: 0.1, inicio: '11/03/2026 11:24', fin: '11/03/2026 12:30'},
    {estado: 'In Process', dias: 0, inicio: '11/03/2026 12:30', fin: '11/03/2026 12:32'},
    {estado: 'In Test', dias: 0.9, inicio: '11/03/2026 12:32', fin: '12/03/2026 11:55'},
    {estado: 'Finalizados', dias: 7.6, inicio: '12/03/2026 11:55', fin: 'En curso'}
  ],
  'IMS-1180': [
    {estado: 'To do', dias: 0.5, inicio: '12/03/2026 12:21', fin: '12/03/2026 16:50'},
    {estado: 'In Process', dias: 0, inicio: '12/03/2026 16:50', fin: '12/03/2026 17:02'},
    {estado: 'CODE REVIEW', dias: 1.1, inicio: '12/03/2026 17:02', fin: '16/03/2026 08:41'},
    {estado: 'IN TEST DEV', dias: 0.1, inicio: '16/03/2026 08:41', fin: '16/03/2026 09:18'},
    {estado: 'In Test', dias: 0, inicio: '16/03/2026 09:18', fin: '16/03/2026 09:28'},
    {estado: 'Finalizados', dias: 5.8, inicio: '16/03/2026 09:28', fin: 'En curso'}
  ],
  'IMS-1181': [
    {estado: 'To do', dias: 0, inicio: '12/03/2026 14:40', fin: '12/03/2026 14:41'},
    {estado: 'In Test', dias: 3.5, inicio: '12/03/2026 14:41', fin: '18/03/2026 09:57'},
    {estado: 'Finalizados', dias: 3.8, inicio: '18/03/2026 09:57', fin: 'En curso'}
  ],
  'IMS-1182': [
    {estado: 'To do', dias: 0, inicio: '13/03/2026 09:34', fin: '13/03/2026 09:34'},
    {estado: 'In Process', dias: 0, inicio: '13/03/2026 09:34', fin: '13/03/2026 09:41'},
    {estado: 'IN TEST DEV', dias: 0.8, inicio: '13/03/2026 09:41', fin: '16/03/2026 08:11'},
    {estado: 'In Test', dias: 0, inicio: '16/03/2026 08:11', fin: '16/03/2026 08:16'},
    {estado: 'Finalizados', dias: 6, inicio: '16/03/2026 08:16', fin: 'En curso'}
  ],
  'IMS-777': [
    {estado: 'To do', dias: 81.1, inicio: '16/10/2025 09:25', fin: '06/02/2026 10:29'},
    {estado: 'Blocked', dias: 0, inicio: '06/02/2026 10:29', fin: '06/02/2026 10:30'},
    {estado: 'To do', dias: 6.8, inicio: '06/02/2026 10:30', fin: '17/02/2026 08:31'},
    {estado: 'Blocked', dias: 14.2, inicio: '17/02/2026 08:31', fin: '09/03/2026 10:39'},
    {estado: 'In Process', dias: 0, inicio: '09/03/2026 10:39', fin: '09/03/2026 10:40'},
    {estado: 'Blocked', dias: 0, inicio: '09/03/2026 10:40', fin: '09/03/2026 10:58'},
    {estado: 'In Process', dias: 0.1, inicio: '09/03/2026 10:58', fin: '09/03/2026 11:45'},
    {estado: 'Blocked', dias: 10.6, inicio: '09/03/2026 11:45', fin: 'En curso'}
  ],
  'IMS-860': [
    {estado: 'To do', dias: 45, inicio: '24/11/2025 08:45', fin: '26/01/2026 08:18'},
    {estado: 'In Process', dias: 0.3, inicio: '26/01/2026 08:18', fin: '26/01/2026 11:09'},
    {estado: 'To do', dias: 3.4, inicio: '26/01/2026 11:09', fin: '29/01/2026 15:09'},
    {estado: 'In Process', dias: 5, inicio: '29/01/2026 15:09', fin: '05/02/2026 15:27'},
    {estado: 'CODE REVIEW', dias: 0.4, inicio: '05/02/2026 15:27', fin: '06/02/2026 10:00'},
    {estado: 'IN TEST DEV', dias: 7.2, inicio: '06/02/2026 10:00', fin: '17/02/2026 12:15'},
    {estado: 'In Test', dias: 0.6, inicio: '17/02/2026 12:15', fin: '18/02/2026 08:20'},
    {estado: 'Finalizados', dias: 24, inicio: '18/02/2026 08:20', fin: 'En curso'}
  ],
  'IMS-874': [
    {estado: 'To do', dias: 35.1, inicio: '25/11/2025 17:21', fin: '14/01/2026 08:50'},
    {estado: 'In Process', dias: 3.8, inicio: '14/01/2026 08:50', fin: '19/01/2026 16:09'},
    {estado: 'To do', dias: 0.1, inicio: '19/01/2026 16:09', fin: '19/01/2026 17:28'},
    {estado: 'In Process', dias: 21.2, inicio: '19/01/2026 17:28', fin: '18/02/2026 09:36'},
    {estado: 'CODE REVIEW', dias: 3.8, inicio: '18/02/2026 09:36', fin: '23/02/2026 17:18'},
    {estado: 'IN TEST DEV', dias: 0.1, inicio: '23/02/2026 17:18', fin: '24/02/2026 09:10'},
    {estado: 'In Test', dias: 0.1, inicio: '24/02/2026 09:10', fin: '24/02/2026 10:28'},
    {estado: 'CODE REVIEW', dias: 5.3, inicio: '24/02/2026 10:28', fin: '03/03/2026 13:27'},
    {estado: 'IN TEST DEV', dias: 6.8, inicio: '03/03/2026 13:27', fin: '12/03/2026 11:57'},
    {estado: 'In Test', dias: 0, inicio: '12/03/2026 11:57', fin: '12/03/2026 11:57'},
    {estado: 'Finalizados', dias: 7.6, inicio: '12/03/2026 11:57', fin: 'En curso'}
  ],
  'IMS-876': [
    {estado: 'To do', dias: 55.1, inicio: '25/11/2025 17:28', fin: '11/02/2026 09:16'},
    {estado: 'In Process', dias: 0.1, inicio: '11/02/2026 09:16', fin: '11/02/2026 10:27'},
    {estado: 'To do', dias: 0, inicio: '11/02/2026 10:27', fin: '11/02/2026 10:43'},
    {estado: 'In Process', dias: 2.2, inicio: '11/02/2026 10:43', fin: '13/02/2026 12:24'},
    {estado: 'CODE REVIEW', dias: 1.8, inicio: '13/02/2026 12:24', fin: '17/02/2026 10:32'},
    {estado: 'IN TEST DEV', dias: 1.7, inicio: '17/02/2026 10:32', fin: '18/02/2026 17:09'},
    {estado: 'In Test', dias: 0, inicio: '18/02/2026 17:09', fin: '18/02/2026 17:09'},
    {estado: 'Finalizados', dias: 23, inicio: '18/02/2026 17:09', fin: 'En curso'}
  ],
  'IMS-877': [
    {estado: 'To do', dias: 3.1, inicio: '25/11/2025 17:29', fin: '01/12/2025 08:51'},
    {estado: 'In Process', dias: 0.1, inicio: '01/12/2025 08:51', fin: '01/12/2025 09:26'},
    {estado: 'To do', dias: 27.9, inicio: '01/12/2025 09:26', fin: '08/01/2026 08:36'},
    {estado: 'In Process', dias: 4, inicio: '08/01/2026 08:36', fin: '14/01/2026 08:49'},
    {estado: 'Blocked', dias: 10.8, inicio: '14/01/2026 08:49', fin: '28/01/2026 16:16'},
    {estado: 'In Process', dias: 1.7, inicio: '28/01/2026 16:16', fin: '30/01/2026 13:36'},
    {estado: 'Blocked', dias: 4.6, inicio: '30/01/2026 13:36', fin: '06/02/2026 10:01'},
    {estado: 'In Process', dias: 6, inicio: '06/02/2026 10:01', fin: '16/02/2026 10:14'},
    {estado: 'IN TEST DEV', dias: 1.8, inicio: '16/02/2026 10:14', fin: '18/02/2026 08:28'},
    {estado: 'In Test', dias: 0, inicio: '18/02/2026 08:28', fin: '18/02/2026 08:43'},
    {estado: 'Finalizados', dias: 0.9, inicio: '18/02/2026 08:43', fin: '18/02/2026 17:25'},
    {estado: 'Test Issues', dias: 0.04, inicio: '18/02/2026 17:25', fin: '18/02/2026 17:44'},
    {estado: 'Finalizados', dias: 23, inicio: '18/02/2026 17:44', fin: 'En curso'}
  ],
  'IMS-878': [
    {estado: 'To do', dias: 13.1, inicio: '25/11/2025 17:30', fin: '15/12/2025 08:34'},
    {estado: 'In Process', dias: 19.2, inicio: '15/12/2025 08:34', fin: '09/01/2026 10:10'},
    {estado: 'CODE REVIEW', dias: 13.7, inicio: '09/01/2026 10:10', fin: '28/01/2026 16:17'},
    {estado: 'In Process', dias: 0, inicio: '28/01/2026 16:17', fin: '28/01/2026 16:17'},
    {estado: 'Blocked', dias: 0, inicio: '28/01/2026 16:17', fin: '28/01/2026 16:17'},
    {estado: 'In Process', dias: 1.7, inicio: '28/01/2026 16:17', fin: '30/01/2026 13:36'},
    {estado: 'Blocked', dias: 5.5, inicio: '30/01/2026 13:36', fin: '09/02/2026 09:21'},
    {estado: 'In Process', dias: 5.1, inicio: '09/02/2026 09:21', fin: '16/02/2026 10:14'},
    {estado: 'IN TEST DEV', dias: 1.8, inicio: '16/02/2026 10:14', fin: '18/02/2026 08:43'},
    {estado: 'In Test', dias: 0, inicio: '18/02/2026 08:43', fin: '18/02/2026 08:44'},
    {estado: 'Finalizados', dias: 23.9, inicio: '18/02/2026 08:44', fin: 'En curso'}
  ],
  'IMS-879': [
    {estado: 'To do', dias: 42.2, inicio: '25/11/2025 18:49', fin: '23/01/2026 10:14'},
    {estado: 'In Process', dias: 1.1, inicio: '23/01/2026 10:14', fin: '26/01/2026 11:07'},
    {estado: 'CODE REVIEW', dias: 0.7, inicio: '26/01/2026 11:07', fin: '26/01/2026 18:45'},
    {estado: 'IN TEST DEV', dias: 0.9, inicio: '26/01/2026 18:45', fin: '27/01/2026 15:44'},
    {estado: 'In Test', dias: 1.4, inicio: '27/01/2026 15:44', fin: '29/01/2026 10:37'},
    {estado: 'IN TEST DEV', dias: 13.2, inicio: '29/01/2026 10:37', fin: '17/02/2026 12:15'},
    {estado: 'In Test', dias: 0.6, inicio: '17/02/2026 12:15', fin: '18/02/2026 08:37'},
    {estado: 'Finalizados', dias: 23.9, inicio: '18/02/2026 08:37', fin: 'En curso'}
  ],
  'IMS-885': [
    {estado: 'To do', dias: 39.4, inicio: '01/12/2025 09:54', fin: '23/01/2026 13:15'},
    {estado: 'In Process', dias: 22, inicio: '23/01/2026 13:15', fin: '24/02/2026 13:19'},
    {estado: 'Blocked', dias: 1.5, inicio: '24/02/2026 13:19', fin: '26/02/2026 08:48'},
    {estado: 'Finalizados', dias: 17.9, inicio: '26/02/2026 08:48', fin: 'En curso'}
  ],
  'IMS-894': [
    {estado: 'To do', dias: 2.4, inicio: '05/12/2025 15:34', fin: '10/12/2025 10:03'},
    {estado: 'In Process', dias: 24, inicio: '10/12/2025 10:03', fin: '13/01/2026 10:06'},
    {estado: 'Blocked', dias: 11.8, inicio: '13/01/2026 10:06', fin: '28/01/2026 18:50'},
    {estado: 'In Process', dias: 13.3, inicio: '28/01/2026 18:50', fin: '17/02/2026 10:20'},
    {estado: 'To do', dias: 0.1, inicio: '17/02/2026 10:20', fin: '17/02/2026 11:07'},
    {estado: 'In Process', dias: 1.9, inicio: '17/02/2026 11:07', fin: '19/02/2026 10:20'},
    {estado: 'CODE REVIEW', dias: 0, inicio: '19/02/2026 10:20', fin: '19/02/2026 10:20'},
    {estado: 'Blocked', dias: 0.3, inicio: '19/02/2026 10:20', fin: '19/02/2026 12:59'},
    {estado: 'CODE REVIEW', dias: 4.4, inicio: '19/02/2026 12:59', fin: '25/02/2026 18:03'},
    {estado: 'In Process', dias: 0.1, inicio: '25/02/2026 18:03', fin: '26/02/2026 09:13'},
    {estado: 'CODE REVIEW', dias: 1.6, inicio: '26/02/2026 09:13', fin: '27/02/2026 14:52'},
    {estado: 'IN TEST DEV', dias: 3.4, inicio: '27/02/2026 14:52', fin: '05/03/2026 09:52'},
    {estado: 'In Test', dias: 0, inicio: '05/03/2026 09:52', fin: '05/03/2026 10:17'},
    {estado: 'Test Issues', dias: 2.9, inicio: '05/03/2026 10:17', fin: '10/03/2026 09:19'},
    {estado: 'In Test', dias: 0, inicio: '10/03/2026 09:19', fin: '10/03/2026 09:24'},
    {estado: 'Finalizados', dias: 9.8, inicio: '10/03/2026 09:24', fin: 'En curso'}
  ],
  'IMS-897': [
    {estado: 'To do', dias: 38, inicio: '05/12/2025 17:25', fin: '28/01/2026 18:50'},
    {estado: 'In Process', dias: 13.3, inicio: '28/01/2026 18:50', fin: '17/02/2026 10:20'},
    {estado: 'To do', dias: 2, inicio: '17/02/2026 10:20', fin: '19/02/2026 10:08'},
    {estado: 'In Process', dias: 1.3, inicio: '19/02/2026 10:08', fin: '20/02/2026 12:31'},
    {estado: 'CODE REVIEW', dias: 5.3, inicio: '20/02/2026 12:31', fin: '27/02/2026 14:52'},
    {estado: 'IN TEST DEV', dias: 1.2, inicio: '27/02/2026 14:52', fin: '02/03/2026 18:43'},
    {estado: 'In Test', dias: 0.2, inicio: '02/03/2026 18:43', fin: '03/03/2026 09:23'},
    {estado: 'Test Issues', dias: 1.1, inicio: '03/03/2026 09:23', fin: '04/03/2026 10:04'},
    {estado: 'IN TEST DEV', dias: 1, inicio: '04/03/2026 10:04', fin: '05/03/2026 10:16'},
    {estado: 'In Test', dias: 0.5, inicio: '05/03/2026 10:16', fin: '05/03/2026 14:33'},
    {estado: 'Finalizados', dias: 12.3, inicio: '05/03/2026 14:33', fin: 'En curso'}
  ],
  'IMS-954': [
    {estado: 'To do', dias: 3.6, inicio: '19/01/2026 16:39', fin: '23/01/2026 13:01'},
    {estado: 'In Process', dias: 1.7, inicio: '23/01/2026 13:01', fin: '27/01/2026 10:24'},
    {estado: 'Blocked', dias: 0, inicio: '27/01/2026 10:24', fin: '27/01/2026 10:34'},
    {estado: 'In Process', dias: 7.9, inicio: '27/01/2026 10:34', fin: '06/02/2026 10:04'},
    {estado: 'CODE REVIEW', dias: 1, inicio: '06/02/2026 10:04', fin: '09/02/2026 10:26'},
    {estado: 'In Process', dias: 5.8, inicio: '09/02/2026 10:26', fin: '17/02/2026 08:18'},
    {estado: 'Blocked', dias: 0, inicio: '17/02/2026 08:18', fin: '17/02/2026 08:18'},
    {estado: 'CODE REVIEW', dias: 0.2, inicio: '17/02/2026 08:18', fin: '17/02/2026 10:26'},
    {estado: 'In Process', dias: 0, inicio: '17/02/2026 10:26', fin: '17/02/2026 10:39'},
    {estado: 'CODE REVIEW', dias: 10.3, inicio: '17/02/2026 10:39', fin: '03/03/2026 13:27'},
    {estado: 'IN TEST DEV', dias: 8.5, inicio: '03/03/2026 13:27', fin: '16/03/2026 09:18'},
    {estado: 'In Test', dias: 2.1, inicio: '16/03/2026 09:18', fin: '18/03/2026 09:53'},
    {estado: 'Finalizados', dias: 3.8, inicio: '18/03/2026 09:53', fin: 'En curso'}
  ],
  'IMS-963': [
    {estado: 'To do', dias: 12.2, inicio: '20/01/2026 15:42', fin: '06/02/2026 08:14'},
    {estado: 'In Process', dias: 0.2, inicio: '06/02/2026 08:14', fin: '06/02/2026 10:04'},
    {estado: 'CODE REVIEW', dias: 1.4, inicio: '06/02/2026 10:04', fin: '09/02/2026 13:46'},
    {estado: 'In Process', dias: 5.4, inicio: '09/02/2026 13:46', fin: '17/02/2026 08:18'},
    {estado: 'CODE REVIEW', dias: 0.2, inicio: '17/02/2026 08:18', fin: '17/02/2026 10:26'},
    {estado: 'In Process', dias: 0, inicio: '17/02/2026 10:26', fin: '17/02/2026 10:39'},
    {estado: 'CODE REVIEW', dias: 10.3, inicio: '17/02/2026 10:39', fin: '03/03/2026 13:27'},
    {estado: 'IN TEST DEV', dias: 1.5, inicio: '03/03/2026 13:27', fin: '05/03/2026 08:59'},
    {estado: 'In Test', dias: 0, inicio: '05/03/2026 08:59', fin: '05/03/2026 09:02'},
    {estado: 'Test Issues', dias: 0.3, inicio: '05/03/2026 09:02', fin: '05/03/2026 12:10'},
    {estado: 'IN TEST DEV', dias: 0.5, inicio: '05/03/2026 12:10', fin: '05/03/2026 16:52'},
    {estado: 'In Test', dias: 0, inicio: '05/03/2026 16:52', fin: '05/03/2026 16:56'},
    {estado: 'Test Issues', dias: 0.3, inicio: '05/03/2026 16:56', fin: '06/03/2026 10:32'},
    {estado: 'In Process', dias: 0, inicio: '06/03/2026 10:32', fin: '06/03/2026 10:56'},
    {estado: 'Blocked', dias: 0, inicio: '06/03/2026 10:56', fin: '06/03/2026 11:16'},
    {estado: 'In Process', dias: 0.1, inicio: '06/03/2026 11:16', fin: '06/03/2026 11:44'},
    {estado: 'CODE REVIEW', dias: 1.6, inicio: '06/03/2026 11:44', fin: '09/03/2026 18:16'},
    {estado: 'IN TEST DEV', dias: 0.1, inicio: '09/03/2026 18:16', fin: '10/03/2026 08:53'},
    {estado: 'Test Issues', dias: 0.1, inicio: '10/03/2026 08:53', fin: '10/03/2026 09:26'},
    {estado: 'In Test', dias: 0, inicio: '10/03/2026 09:26', fin: '10/03/2026 09:27'},
    {estado: 'Test Issues', dias: 2.7, inicio: '10/03/2026 09:27', fin: '12/03/2026 15:21'},
    {estado: 'IN TEST DEV', dias: 0.2, inicio: '12/03/2026 15:21', fin: '12/03/2026 17:38'},
    {estado: 'In Test', dias: 0.04, inicio: '12/03/2026 17:38', fin: '12/03/2026 17:57'},
    {estado: 'Finalizados', dias: 7, inicio: '12/03/2026 17:57', fin: 'En curso'}
  ],
  'IMS-966': [
    {estado: 'To do', dias: 11.7, inicio: '20/01/2026 16:00', fin: '05/02/2026 13:24'},
    {estado: 'In Process', dias: 4.8, inicio: '05/02/2026 13:24', fin: '12/02/2026 11:19'},
    {estado: 'CODE REVIEW', dias: 0.9, inicio: '12/02/2026 11:19', fin: '13/02/2026 10:12'},
    {estado: 'IN TEST DEV', dias: 4.9, inicio: '13/02/2026 10:12', fin: '20/02/2026 09:08'},
    {estado: 'In Test', dias: 1.2, inicio: '20/02/2026 09:08', fin: '23/02/2026 11:23'},
    {estado: 'Finalizados', dias: 20.6, inicio: '23/02/2026 11:23', fin: 'En curso'}
  ],
  'IMS-970': [
    {estado: 'To do', dias: 12, inicio: '20/01/2026 16:23', fin: '05/02/2026 16:39'},
    {estado: 'In Process', dias: 0, inicio: '05/02/2026 16:39', fin: '05/02/2026 17:52'},
    {estado: 'CODE REVIEW', dias: 1.3, inicio: '05/02/2026 17:52', fin: '09/02/2026 10:26'},
    {estado: 'In Process', dias: 0.3, inicio: '09/02/2026 10:26', fin: '09/02/2026 13:32'},
    {estado: 'CODE REVIEW', dias: 0.9, inicio: '09/02/2026 13:32', fin: '10/02/2026 12:59'},
    {estado: 'IN TEST DEV', dias: 2.7, inicio: '10/02/2026 12:59', fin: '13/02/2026 10:11'},
    {estado: 'In Test', dias: 2.9, inicio: '13/02/2026 10:11', fin: '18/02/2026 08:59'},
    {estado: 'Finalizados', dias: 23.9, inicio: '18/02/2026 08:59', fin: 'En curso'}
  ],
  'IMS-974': [
    {estado: 'To do', dias: 12.1, inicio: '20/01/2026 16:29', fin: '05/02/2026 18:42'},
    {estado: 'In Process', dias: 2.2, inicio: '05/02/2026 18:42', fin: '10/02/2026 09:34'},
    {estado: 'CODE REVIEW', dias: 3.1, inicio: '10/02/2026 09:34', fin: '13/02/2026 10:12'},
    {estado: 'In Test', dias: 2.9, inicio: '13/02/2026 10:12', fin: '18/02/2026 09:18'},
    {estado: 'Finalizados', dias: 23.9, inicio: '18/02/2026 09:18', fin: 'En curso'}
  ],
  'IMS-982': [
    {estado: 'To do', dias: 0, inicio: '21/01/2026 16:43', fin: '21/01/2026 16:46'},
    {estado: 'In Process', dias: 1, inicio: '21/01/2026 16:46', fin: '22/01/2026 17:32'},
    {estado: 'CODE REVIEW', dias: 2, inicio: '22/01/2026 17:32', fin: '26/01/2026 17:59'},
    {estado: 'IN TEST DEV', dias: 0.4, inicio: '26/01/2026 17:59', fin: '27/01/2026 11:43'},
    {estado: 'In Process', dias: 3.6, inicio: '27/01/2026 11:43', fin: '31/01/2026 10:11'},
    {estado: 'CODE REVIEW', dias: 0.1, inicio: '31/01/2026 10:11', fin: '02/02/2026 08:43'},
    {estado: 'IN TEST DEV', dias: 8.2, inicio: '02/02/2026 08:43', fin: '12/02/2026 10:27'},
    {estado: 'Finalizados', dias: 12.5, inicio: '12/02/2026 10:27', fin: '02/03/2026 15:03'},
    {estado: 'In Process', dias: 0.2, inicio: '02/03/2026 15:03', fin: '02/03/2026 20:51'},
    {estado: 'To do', dias: 2.3, inicio: '02/03/2026 20:51', fin: '05/03/2026 10:52'},
    {estado: 'Finalizados', dias: 12.7, inicio: '05/03/2026 10:52', fin: 'En curso'}
  ],
  'IMS-984': [
    {estado: 'To do', dias: 3.4, inicio: '21/01/2026 16:48', fin: '27/01/2026 11:29'},
    {estado: 'In Process', dias: 0, inicio: '27/01/2026 11:29', fin: '27/01/2026 11:29'},
    {estado: 'To do', dias: 0, inicio: '27/01/2026 11:29', fin: '27/01/2026 11:29'},
    {estado: 'In Process', dias: 0.2, inicio: '27/01/2026 11:29', fin: '27/01/2026 13:39'},
    {estado: 'To do', dias: 5, inicio: '27/01/2026 13:39', fin: '03/02/2026 13:45'},
    {estado: 'In Process', dias: 4, inicio: '03/02/2026 13:45', fin: '09/02/2026 13:31'},
    {estado: 'CODE REVIEW', dias: 5.7, inicio: '09/02/2026 13:31', fin: '17/02/2026 10:29'},
    {estado: 'In Test', dias: 2.5, inicio: '17/02/2026 10:29', fin: '19/02/2026 15:17'},
    {estado: 'IN TEST DEV', dias: 2.8, inicio: '19/02/2026 15:17', fin: '24/02/2026 13:48'},
    {estado: 'In Test', dias: 0, inicio: '24/02/2026 13:48', fin: '24/02/2026 13:48'},
    {estado: 'Test Issues', dias: 1.9, inicio: '24/02/2026 13:48', fin: '26/02/2026 12:40'},
    {estado: 'Blocked', dias: 0.7, inicio: '26/02/2026 12:40', fin: '27/02/2026 10:15'},
    {estado: 'In Process', dias: 0, inicio: '27/02/2026 10:15', fin: '27/02/2026 10:15'},
    {estado: 'Blocked', dias: 0.7, inicio: '27/02/2026 10:15', fin: '02/03/2026 07:30'},
    {estado: 'IN TEST DEV', dias: 6.1, inicio: '02/03/2026 07:30', fin: '10/03/2026 09:01'},
    {estado: 'Blocked', dias: 1.1, inicio: '10/03/2026 09:01', fin: '11/03/2026 10:07'},
    {estado: 'In Process', dias: 7.8, inicio: '11/03/2026 10:07', fin: '23/03/2026 08:46'},
    {estado: 'IN TEST DEV', dias: 0.9, inicio: '23/03/2026 08:46', fin: 'En curso'}
  ],
  'IMS-987': [
    {estado: 'To do', dias: 2.4, inicio: '21/01/2026 17:08', fin: '26/01/2026 11:48'},
    {estado: 'In Process', dias: 3.3, inicio: '26/01/2026 11:48', fin: '29/01/2026 14:43'},
    {estado: 'Blocked', dias: 10.6, inicio: '29/01/2026 14:43', fin: '13/02/2026 11:31'},
    {estado: 'In Process', dias: 3.9, inicio: '13/02/2026 11:31', fin: '19/02/2026 10:29'},
    {estado: 'Blocked', dias: 7, inicio: '19/02/2026 10:29', fin: '02/03/2026 10:12'},
    {estado: 'In Process', dias: 1.1, inicio: '02/03/2026 10:12', fin: '03/03/2026 10:59'},
    {estado: 'Blocked', dias: 1.2, inicio: '03/03/2026 10:59', fin: '04/03/2026 12:37'},
    {estado: 'In Process', dias: 2.6, inicio: '04/03/2026 12:37', fin: '09/03/2026 09:12'},
    {estado: 'CODE REVIEW', dias: 0.9, inicio: '09/03/2026 09:12', fin: '09/03/2026 17:27'},
    {estado: 'IN TEST DEV', dias: 0.2, inicio: '09/03/2026 17:27', fin: '10/03/2026 09:57'},
    {estado: 'In Test', dias: 0, inicio: '10/03/2026 09:57', fin: '10/03/2026 09:57'},
    {estado: 'Finalizados', dias: 9.8, inicio: '10/03/2026 09:57', fin: 'En curso'}
  ],
  'IMS-990': [
    {estado: 'To do', dias: 20.3, inicio: '21/01/2026 17:54', fin: '19/02/2026 10:50'},
    {estado: 'In Process', dias: 2.9, inicio: '19/02/2026 10:50', fin: '24/02/2026 10:10'},
    {estado: 'Blocked', dias: 3.5, inicio: '24/02/2026 10:10', fin: '27/02/2026 14:54'},
    {estado: 'In Process', dias: 2.9, inicio: '27/02/2026 14:54', fin: '04/03/2026 14:05'},
    {estado: 'Blocked', dias: 2.3, inicio: '04/03/2026 14:05', fin: '06/03/2026 19:36'},
    {estado: 'In Process', dias: 1, inicio: '06/03/2026 19:36', fin: '10/03/2026 03:15'},
    {estado: 'Blocked', dias: 0.5, inicio: '10/03/2026 03:15', fin: '10/03/2026 12:47'},
    {estado: 'In Process', dias: 1.5, inicio: '10/03/2026 12:47', fin: '11/03/2026 16:59'},
    {estado: 'Blocked', dias: 2.2, inicio: '11/03/2026 16:59', fin: '16/03/2026 09:42'},
    {estado: 'In Process', dias: 0.8, inicio: '16/03/2026 09:42', fin: '16/03/2026 18:57'},
    {estado: 'Blocked', dias: 4.1, inicio: '16/03/2026 18:57', fin: '23/03/2026 08:46'},
    {estado: 'In Process', dias: 0.9, inicio: '23/03/2026 08:46', fin: '23/03/2026 16:58'},
    {estado: 'IN TEST DEV', dias: 0, inicio: '23/03/2026 16:58', fin: 'En curso'}
  ],
  'IMS-992': [
    {estado: 'To do', dias: 19.3, inicio: '21/01/2026 17:57', fin: '18/02/2026 10:45'},
    {estado: 'In Process', dias: 1, inicio: '18/02/2026 10:45', fin: '19/02/2026 10:37'},
    {estado: 'Blocked', dias: 3.6, inicio: '19/02/2026 10:37', fin: '24/02/2026 15:36'},
    {estado: 'In Process', dias: 0.1, inicio: '24/02/2026 15:36', fin: '24/02/2026 16:24'},
    {estado: 'Blocked', dias: 2, inicio: '24/02/2026 16:24', fin: '26/02/2026 16:44'},
    {estado: 'In Process', dias: 0, inicio: '26/02/2026 16:44', fin: '26/02/2026 17:07'},
    {estado: 'Blocked', dias: 0.1, inicio: '26/02/2026 17:07', fin: '27/02/2026 08:52'},
    {estado: 'In Process', dias: 0.1, inicio: '27/02/2026 08:52', fin: '27/02/2026 10:04'},
    {estado: 'Blocked', dias: 0.3, inicio: '27/02/2026 10:04', fin: '27/02/2026 12:27'},
    {estado: 'In Process', dias: 0.5, inicio: '27/02/2026 12:27', fin: '27/02/2026 17:13'},
    {estado: 'CODE REVIEW', dias: 1, inicio: '27/02/2026 17:13', fin: '02/03/2026 17:21'},
    {estado: 'IN TEST DEV', dias: 2.1, inicio: '02/03/2026 17:21', fin: '05/03/2026 09:14'},
    {estado: 'In Test', dias: 0, inicio: '05/03/2026 09:14', fin: '05/03/2026 09:20'},
    {estado: 'Finalizados', dias: 12.9, inicio: '05/03/2026 09:20', fin: 'En curso'}
  ],
  'IMS-993': [
    {estado: 'To do', dias: 20, inicio: '21/01/2026 17:58', fin: '19/02/2026 07:57'},
    {estado: 'In Process', dias: 0.6, inicio: '19/02/2026 07:57', fin: '19/02/2026 13:27'},
    {estado: 'Blocked', dias: 2.4, inicio: '19/02/2026 13:27', fin: '23/02/2026 16:45'},
    {estado: 'In Process', dias: 0.3, inicio: '23/02/2026 16:45', fin: '24/02/2026 10:03'},
    {estado: 'Blocked', dias: 2, inicio: '24/02/2026 10:03', fin: '26/02/2026 10:25'},
    {estado: 'In Process', dias: 0.2, inicio: '26/02/2026 10:25', fin: '26/02/2026 12:04'},
    {estado: 'Blocked', dias: 0.5, inicio: '26/02/2026 12:04', fin: '26/02/2026 16:22'},
    {estado: 'In Process', dias: 0, inicio: '26/02/2026 16:22', fin: '26/02/2026 16:44'},
    {estado: 'Blocked', dias: 0.3, inicio: '26/02/2026 16:44', fin: '27/02/2026 10:04'},
    {estado: 'In Process', dias: 0, inicio: '27/02/2026 10:04', fin: '27/02/2026 10:04'},
    {estado: 'Blocked', dias: 0.1, inicio: '27/02/2026 10:04', fin: '27/02/2026 10:51'},
    {estado: 'In Process', dias: 0.2, inicio: '27/02/2026 10:51', fin: '27/02/2026 12:27'},
    {estado: 'Blocked', dias: 0.5, inicio: '27/02/2026 12:27', fin: '27/02/2026 17:21'},
    {estado: 'CODE REVIEW', dias: 1, inicio: '27/02/2026 17:21', fin: '02/03/2026 17:20'},
    {estado: 'IN TEST DEV', dias: 2.1, inicio: '02/03/2026 17:20', fin: '05/03/2026 09:14'},
    {estado: 'In Test', dias: 0, inicio: '05/03/2026 09:14', fin: '05/03/2026 09:20'},
    {estado: 'Finalizados', dias: 12.9, inicio: '05/03/2026 09:20', fin: 'En curso'}
  ],
  'IMS-994': [
    {estado: 'To do', dias: 20.6, inicio: '21/01/2026 17:58', fin: '19/02/2026 13:27'},
    {estado: 'In Process', dias: 0.3, inicio: '19/02/2026 13:27', fin: '19/02/2026 16:11'},
    {estado: 'Blocked', dias: 2.3, inicio: '19/02/2026 16:11', fin: '24/02/2026 10:03'},
    {estado: 'In Process', dias: 0.6, inicio: '24/02/2026 10:03', fin: '24/02/2026 15:36'},
    {estado: 'Blocked', dias: 1.6, inicio: '24/02/2026 15:36', fin: '26/02/2026 12:04'},
    {estado: 'In Process', dias: 0.5, inicio: '26/02/2026 12:04', fin: '26/02/2026 16:22'},
    {estado: 'Blocked', dias: 0.3, inicio: '26/02/2026 16:22', fin: '27/02/2026 10:04'},
    {estado: 'In Process', dias: 0.1, inicio: '27/02/2026 10:04', fin: '27/02/2026 10:51'},
    {estado: 'Blocked', dias: 0.6, inicio: '27/02/2026 10:51', fin: '27/02/2026 15:52'},
    {estado: 'CODE REVIEW', dias: 1.1, inicio: '27/02/2026 15:52', fin: '02/03/2026 17:21'},
    {estado: 'IN TEST DEV', dias: 2.1, inicio: '02/03/2026 17:21', fin: '05/03/2026 09:14'},
    {estado: 'In Test', dias: 0, inicio: '05/03/2026 09:14', fin: '05/03/2026 09:20'},
    {estado: 'Finalizados', dias: 12.9, inicio: '05/03/2026 09:20', fin: 'En curso'}
  ],
  'IMS-997': [
    {estado: 'To do', dias: 27, inicio: '21/01/2026 18:03', fin: '01/03/2026 21:33'},
    {estado: 'In Process', dias: 0, inicio: '01/03/2026 21:33', fin: '01/03/2026 21:33'},
    {estado: 'To do', dias: 7.3, inicio: '01/03/2026 21:33', fin: '11/03/2026 10:25'},
    {estado: 'Blocked', dias: 8.7, inicio: '11/03/2026 10:25', fin: 'En curso'}
  ],
  'IMS-998': [
    {estado: 'To do', dias: 23, inicio: '21/01/2026 18:03', fin: '23/02/2026 16:48'},
    {estado: 'In Process', dias: 3, inicio: '23/02/2026 16:48', fin: '26/02/2026 20:45'},
    {estado: 'CODE REVIEW', dias: 2.1, inicio: '26/02/2026 20:45', fin: '03/03/2026 09:16'},
    {estado: 'IN TEST DEV', dias: 0.2, inicio: '03/03/2026 09:16', fin: '03/03/2026 10:43'},
    {estado: 'In Test', dias: 0, inicio: '03/03/2026 10:43', fin: '03/03/2026 10:43'},
    {estado: 'Finalizados', dias: 14.7, inicio: '03/03/2026 10:43', fin: 'En curso'}
  ],
  'IMS-999': [
    {estado: 'To do', dias: 27, inicio: '21/01/2026 18:04', fin: '01/03/2026 21:32'},
    {estado: 'In Process', dias: 0, inicio: '01/03/2026 21:32', fin: '01/03/2026 21:33'},
    {estado: 'To do', dias: 1.1, inicio: '01/03/2026 21:33', fin: '03/03/2026 09:16'},
    {estado: 'In Process', dias: 3.2, inicio: '03/03/2026 09:16', fin: '06/03/2026 10:40'},
    {estado: 'Blocked', dias: 11.7, inicio: '06/03/2026 10:40', fin: 'En curso'}
  ]

};
