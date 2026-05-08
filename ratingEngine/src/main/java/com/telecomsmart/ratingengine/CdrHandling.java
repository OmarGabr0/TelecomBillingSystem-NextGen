package com.telecomsmart.ratingengine;
import com.telecomsmart.model.*;
import com.telecomsmart.dao.CdrRecordDao;
import java.util.List;
/**
 *
 * @author Mahmoud
 */

public class CdrHandling {
    public static List<CdrRecord> getCdrs() {
        CdrRecordDao cdrRecordDao = new CdrRecordDao();
        return cdrRecordDao.getAndDeleteCdrRecords();
    }
}