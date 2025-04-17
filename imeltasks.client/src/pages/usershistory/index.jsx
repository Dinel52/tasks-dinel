import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserHistory, restoreUserVersion } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

import DataGrid, {
  Column,
  Paging,
  Pager,
  Scrolling,
  Export,
  HeaderFilter,
  LoadPanel,
  Selection,
} from 'devextreme-react/data-grid';
import 'devextreme/dist/css/dx.light.css';

const UserHistory = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dataGridRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getUserHistory(id);
        setHistory(data);
        setTotalCount(data.length);
      } catch (err) {
        setError(t('userHistory.errors.loadFailed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id, t]);

  const handlePageChange = (e) => {
    setPageIndex(e.value);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(e.value);
    setPageIndex(0);
  };

  const handleRestore = async () => {
    try {
      await restoreUserVersion(id, selectedVersion.versionId);
      setConfirmDialog(false);

      const data = await getUserHistory(id);
      setHistory(data);
      setTotalCount(data.length);

    } catch (err) {
      setError(t('userHistory.errors.restoreFailed'));
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderDateCell = (cellData) => {
    return <span>{formatDate(cellData.value)}</span>;
  };

  const renderAdminCell = (cellData) => {
    return <span>{cellData.value ? t('userHistory.adminStatus.yes') : t('userHistory.adminStatus.no')}</span>;
  };

  const renderActionCell = (cellData) => {
    return (
      <Button
        variant="default"
        onClick={() => {
          setSelectedVersion(cellData.data);
          setConfirmDialog(true);
        }}
      >
        {t('userHistory.actions.restore')}
      </Button>
    );
  };

  if (loading && history.length === 0) return <div className="p-8 text-center">{t('userHistory.loading')}</div>;
  if (error) return <Alert variant="destructive" className="m-8"><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('userHistory.title')}</h1>
        <Button onClick={() => navigate('/admin/users')}>{t('userHistory.backToUsers')}</Button>
      </div>

      {history.length === 0 ? (
        <div className="text-center my-8">{t('userHistory.noRecords')}</div>
      ) : (
        <div className="w-full">
          <DataGrid
            ref={dataGridRef}
            dataSource={history}
            showBorders={true}
            columnAutoWidth={true}
            rowAlternationEnabled={true}
            allowColumnResizing={true}
            selection={{ mode: 'single' }}
            onSelectionChanged={(e) => {
              const selectedRows = e.selectedRowsData;
              if (selectedRows.length > 0) {
                setSelectedVersion(selectedRows[0]);
              } else {
                setSelectedVersion(null);
              }
            }}
            keyExpr="versionId"
            loadPanel={{ enabled: loading }}
            className="dx-theme-light"
            onOptionChanged={(e) => {
              if (e.fullName === 'paging.pageIndex') {
                handlePageChange(e);
              }
              if (e.fullName === 'paging.pageSize') {
                handlePageSizeChange(e);
              }
            }}
          >
            <Export enabled={false} allowExportSelectedData={true} />
            <Scrolling mode="standard" />
            <Paging
              defaultPageSize={pageSize}
              defaultPageIndex={pageIndex}
              enabled={true}
            />
            <Pager
              visible={true}
              showPageSizeSelector={true}
              allowedPageSizes={[5, 10, 25, 50]}
              showInfo={true}
              showNavigationButtons={true}
              totalCount={totalCount}
            />
            <HeaderFilter visible={true} />
            <LoadPanel enabled={loading} />
            <Selection mode="single" />

            <Column
              dataField="versionNumber"
              caption={t('userHistory.tableColumns.version')}
              sortOrder="desc"
            />
            <Column
              dataField="username"
              caption={t('userHistory.tableColumns.username')}
            />
            <Column
              dataField="email"
              caption={t('userHistory.tableColumns.email')}
            />
            <Column
              dataField="name"
              caption={t('userHistory.tableColumns.name')}
            />
            <Column
              dataField="isAdmin"
              caption={t('userHistory.tableColumns.admin')}
              dataType="boolean"
              cellRender={renderAdminCell}
            />
            <Column
              dataField="versionDate"
              caption={t('userHistory.tableColumns.date')}
              dataType="datetime"
              cellRender={renderDateCell}
            />
            <Column
              caption={t('userHistory.tableColumns.actions')}
              cellRender={renderActionCell}
              allowFiltering={false}
              allowSorting={false}
              width={150}
            />
          </DataGrid>
        </div>
      )}

      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className='bg-background text-theme-text'>
          <DialogHeader>
            <DialogTitle>{t('userHistory.confirmDialog.title')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedVersion && t('userHistory.confirmDialog.message', {
              version: selectedVersion.versionNumber,
              date: formatDate(selectedVersion.versionDate),
            })}
          </div>
          <DialogFooter>
            <Button variant="default" onClick={() => setConfirmDialog(false)}>
              {t('userHistory.confirmDialog.cancel')}
            </Button>
            <Button onClick={handleRestore}>
              {t('userHistory.confirmDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserHistory;
