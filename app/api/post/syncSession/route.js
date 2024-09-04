import { updateSessionIdEmail } from '../../../_lib/db'; // 세션 정보를 DB에 업데이트하는 함수

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const session = req.body;

      // 세션 정보를 데이터베이스에 저장 또는 업데이트하는 함수 호출
      const result = await updateSessionIdEmail(session);

      if (result.success) {
        res.status(200).json({ message: 'Session synchronized successfully' });
      } else {
        res.status(500).json({ message: 'Failed to synchronize session' });
      }
    } catch (error) {
      console.error('Error syncing session:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
