
import mn from './data/mn.json';
import th from './data/th.json';
import thcs from './data/thcs.json';
import thpt from './data/thpt.json';

export const resources: Record<string, any> = {
    mn: {
        title: 'PHỤ LỤC 1: SỐ LƯỢNG NGƯỜI LÀM VIỆC TRONG CÁC TRƯỜNG MẦM NON CÔNG LẬP',
        data: mn
    },
    th: {
        title: 'PHỤ LỤC 2: SỐ LƯỢNG NGƯỜI LÀM VIỆC TRONG CÁC TRƯỜNG TIỂU HỌC CÔNG LẬP',
        data: th
    },
    thcs: {
        title: 'PHỤ LỤC 3: SỐ LƯỢNG NGƯỜI LÀM VIỆC TRONG CÁC TRƯỜNG THCS CÔNG LẬP ',
        data: thcs,
    },
    thpt: {
        title: 'PHỤ LỤC 4: SỐ LƯỢNG NGƯỜI LÀM VIỆC TRONG CÁC TRƯỜNG THPT CÔNG LẬP',
        data: thpt,
    }
};