
import mn from './data/mn.json';
import th from './data/th.json';
import thcs from './data/thcs.json';
import thpt from './data/thpt.json';

export const resources: Record<string, {
    key: string;
    title: string;
    data: any;
    template: string;
    rowIndex: number;
    endColumn: string;
}> = {
    mn: {
        key: 'mn',
        title: 'PHỤ LỤC 1: SỐ LƯỢNG NGƯỜI LÀM VIỆC TRONG CÁC TRƯỜNG MẦM NON CÔNG LẬP',
        data: mn,
        template: '/templates/mn.xlsx',
        rowIndex: 8,
        endColumn: 'AN'
    },
    th: {
        key: 'th',
        title: 'PHỤ LỤC 2: SỐ LƯỢNG NGƯỜI LÀM VIỆC TRONG CÁC TRƯỜNG TIỂU HỌC CÔNG LẬP',
        data: th,
        template: '/templates/th.xlsx',
        rowIndex: 6,
        endColumn: 'AI'
    },
    thcs: {
        key: 'thcs',
        title: 'PHỤ LỤC 3: SỐ LƯỢNG NGƯỜI LÀM VIỆC TRONG CÁC TRƯỜNG THCS CÔNG LẬP ',
        data: thcs,
        template: '/templates/thcs.xlsx',
        rowIndex: 7,
        endColumn: 'AO'
    },
    thpt: {
        key: 'thpt',
        title: 'PHỤ LỤC 4: SỐ LƯỢNG NGƯỜI LÀM VIỆC TRONG CÁC TRƯỜNG THPT CÔNG LẬP',
        data: thpt,
        template: '/templates/thpt.xlsx',
        rowIndex: 7,
        endColumn: 'AP'
    }
};

export const otherReports: Record<string, {
    key: string;
    title: string;
    template: string;
}> = {
    tienDo: {
        key: 'tienDo',
        title: 'Tiến độ báo cáo',
        template: '/templates/tien_do.xlsx'
    },
    truongLopHS: {
        key: 'truongLopHS',
        title: 'Số Liệu Trường, Lớp, Học Sinh',
        template: '/templates/truong_lop_hs.xlsx'
    }
};